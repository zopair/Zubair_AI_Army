export const ALLOWED_OPERATIONS = Object.freeze([
  "repository_inventory",
  "repository_documentation_audit"
]);

export class RetryableTaskError extends Error {
  constructor(message = "Temporary GitHub API failure") {
    super(message);
    this.name = "RetryableTaskError";
  }
}

export class RateLimitExceededError extends Error {
  constructor() {
    super("GitHub API rate limit reached; task stopped without retry");
    this.name = "RateLimitExceededError";
  }
}

export class RequestBudgetExceededError extends Error {
  constructor(limit) {
    super(`GitHub API request budget exceeded (${limit} requests)`);
    this.name = "RequestBudgetExceededError";
  }
}

const MAX_API_REQUESTS_PER_TASK = 50;

function createRequestBudget(limit = MAX_API_REQUESTS_PER_TASK) {
  let used = 0;
  return {
    consume() {
      if (used >= limit) throw new RequestBudgetExceededError(limit);
      used += 1;
    }
  };
}

function parseRepository(value) {
  if (typeof value !== "string") throw new Error("Repository configuration is invalid");
  const parts = value.split("/");
  if (parts.length !== 2 || parts.some((part) => !/^[A-Za-z0-9_.-]+$/.test(part))) {
    throw new Error("Repository configuration is invalid");
  }
  return parts;
}

async function githubJson(env, path, fetchImpl, requestBudget) {
  if (typeof env.GITHUB_TOKEN !== "string" || !env.GITHUB_TOKEN) {
    throw new Error("GitHub read token is not configured");
  }

  requestBudget.consume();

  let response;
  try {
    response = await fetchImpl(`https://api.github.com${path}`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${env.GITHUB_TOKEN}`,
        accept: "application/vnd.github+json",
        "x-github-api-version": "2022-11-28",
        "user-agent": "zopair-personal-agent"
      },
      signal: AbortSignal.timeout(10000)
    });
  } catch {
    throw new RetryableTaskError();
  }

  const rateLimited = response.status === 429 ||
    (response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0");

  if (rateLimited) {
    throw new RateLimitExceededError();
  }
  if (response.status >= 500) {
    throw new RetryableTaskError();
  }
  if (!response.ok) {
    throw new Error(response.status === 404
      ? "Repository or Git tree was not found"
      : `GitHub API request failed (HTTP ${response.status})`);
  }

  try {
    return await response.json();
  } catch {
    throw new Error("GitHub API returned an invalid response");
  }
}

const MAX_TREE_OBJECTS = 1000;

async function recoverTreeFiles(env, owner, repository, rootTreeSha, fetchImpl, requestBudget) {
  const encodedOwner = encodeURIComponent(owner);
  const encodedRepository = encodeURIComponent(repository);
  const pending = [{ sha: rootTreeSha, prefix: "" }];
  const visited = new Set();
  const files = [];

  while (pending.length > 0) {
    const current = pending.shift();
    const visitKey = `${current.sha}:${current.prefix}`;
    if (visited.has(visitKey)) continue;
    visited.add(visitKey);

    if (visited.size > MAX_TREE_OBJECTS) {
      throw new Error("GitHub tree recovery exceeded the directory traversal limit");
    }

    const tree = await githubJson(
      env,
      `/repos/${encodedOwner}/${encodedRepository}/git/trees/${encodeURIComponent(current.sha)}`,
      fetchImpl,
      requestBudget
    );

    if (!Array.isArray(tree.tree)) {
      throw new Error("GitHub repository tree is unavailable during fallback traversal");
    }
    if (tree.truncated === true) {
      throw new Error("GitHub returned a truncated directory tree during fallback traversal");
    }

    for (const entry of tree.tree) {
      if (typeof entry.path !== "string" || !entry.path) continue;
      const path = current.prefix ? `${current.prefix}/${entry.path}` : entry.path;

      if (entry.type === "blob") {
        files.push({ path, type: "blob" });
      } else if (entry.type === "tree") {
        if (typeof entry.sha !== "string" || !entry.sha) {
          throw new Error("GitHub returned a directory without a tree SHA");
        }
        pending.push({ sha: entry.sha, prefix: path });
      }
    }
  }

  return files.sort((left, right) => left.path.localeCompare(right.path));
}

async function loadRepositoryTree(env, fetchImpl) {
  const requestBudget = createRequestBudget();
  const [owner, repository] = parseRepository(env.GITHUB_REPOSITORY);
  const encodedOwner = encodeURIComponent(owner);
  const encodedRepository = encodeURIComponent(repository);
  const metadata = await githubJson(
    env,
    `/repos/${encodedOwner}/${encodedRepository}`,
    fetchImpl,
    requestBudget
  );

  if (typeof metadata.default_branch !== "string" || !metadata.default_branch) {
    throw new Error("Repository default branch is unavailable");
  }

  const tree = await githubJson(
    env,
    `/repos/${encodedOwner}/${encodedRepository}/git/trees/${encodeURIComponent(metadata.default_branch)}?recursive=1`,
    fetchImpl,
    requestBudget
  );

  if (!Array.isArray(tree.tree)) {
    throw new Error("GitHub repository tree is unavailable");
  }

  const recoveredFromTruncation = tree.truncated === true;
  let files = tree.tree.filter((entry) => entry.type === "blob" && typeof entry.path === "string");

  if (recoveredFromTruncation) {
    if (typeof tree.sha !== "string" || !tree.sha) {
      throw new Error("GitHub did not provide the truncated root tree SHA");
    }
    files = await recoverTreeFiles(env, owner, repository, tree.sha, fetchImpl, requestBudget);
  }

  return {
    repository: `${owner}/${repository}`,
    default_branch: metadata.default_branch,
    truncated: false,
    recoveredFromTruncation,
    files
  };
}

function summarizeExtensions(files) {
  const counts = new Map();
  for (const file of files) {
    const name = file.path.split("/").pop() || "";
    const extension = name.includes(".") ? name.split(".").pop().toLowerCase() : "[no extension]";
    counts.set(extension, (counts.get(extension) || 0) + 1);
  }
  return Object.fromEntries(
    [...counts.entries()].sort((left, right) => right[1] - left[1]).slice(0, 12)
  );
}

function repositoryInventory(snapshot) {
  const directories = new Set();
  for (const file of snapshot.files) {
    const firstSegment = file.path.split("/")[0];
    if (file.path.includes("/")) directories.add(firstSegment);
  }

  return {
    operation: "repository_inventory",
    repository: snapshot.repository,
    default_branch: snapshot.default_branch,
    tracked_file_count: snapshot.files.length,
    top_level_directories: [...directories].sort().slice(0, 30),
    file_extensions: summarizeExtensions(snapshot.files),
    tree_truncated: snapshot.truncated,
    tree_recovered_from_truncation: snapshot.recoveredFromTruncation
  };
}

function documentationAudit(snapshot) {
  const paths = new Set(snapshot.files.map((file) => file.path));
  const requiredDocuments = ["README.md", "LICENSE", "CONTRIBUTING.md", "SECURITY.md"];
  const missingDocuments = requiredDocuments.filter((path) => !paths.has(path));
  const testFiles = snapshot.files.filter((file) => {
    const segments = file.path.split("/");
    return segments.some((segment) => ["test", "tests", "__tests__"].includes(segment)) ||
      file.path.includes(".test.");
  });
  const workflowFiles = snapshot.files.filter((file) =>
    file.path.startsWith(".github/workflows/") &&
    (file.path.endsWith(".yml") || file.path.endsWith(".yaml"))
  );

  return {
    operation: "repository_documentation_audit",
    repository: snapshot.repository,
    default_branch: snapshot.default_branch,
    required_documents: requiredDocuments.map((path) => ({
      path,
      present: paths.has(path)
    })),
    missing_documents: missingDocuments,
    workflow_count: workflowFiles.length,
    test_file_count: testFiles.length,
    docs_directory_present: [...paths].some((path) => path.startsWith("docs/")),
    tree_truncated: snapshot.truncated,
    tree_recovered_from_truncation: snapshot.recoveredFromTruncation,
    recommendations: [
      ...(missingDocuments.includes("LICENSE") ? ["Choose and add an explicit repository license before external redistribution."] : []),
      ...(testFiles.length === 0 ? ["Add automated tests for the primary runtime paths."] : []),
      ...(workflowFiles.length === 0 ? ["Add a CI workflow that validates the repository's real build and tests."] : []),
      ...(snapshot.truncated ? ["GitHub truncated the recursive tree; repeat the audit with a narrower scope for complete coverage."] : [])
    ]
  };
}

export async function executeAllowlistedTask(operation, env, fetchImpl = fetch) {
  if (!ALLOWED_OPERATIONS.includes(operation)) {
    throw new Error("Unsupported task operation");
  }

  const snapshot = await loadRepositoryTree(env, fetchImpl);
  if (operation === "repository_inventory") return repositoryInventory(snapshot);
  return documentationAudit(snapshot);
}
