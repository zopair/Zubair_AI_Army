import test from "node:test";
import assert from "node:assert/strict";
import {
  ALLOWED_OPERATIONS,
  executeAllowlistedTask,
  RateLimitExceededError,
  RequestBudgetExceededError
} from "./task_executor.js";

const env = {
  GITHUB_TOKEN: "test-token",
  GITHUB_REPOSITORY: "zopair/Zubair_AI_Army"
};

function response(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers });
}

test("only exposes fixed, allowlisted operations", () => {
  assert.deepEqual(ALLOWED_OPERATIONS, [
    "repository_inventory",
    "repository_documentation_audit"
  ]);
});

test("repository inventory returns bounded metadata without file contents", async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(String(url));
    if (calls.length === 1) return response({ default_branch: "main" });
    return response({
      truncated: false,
      tree: [
        { path: "README.md", type: "blob" },
        { path: "src/index.ts", type: "blob" },
        { path: "src/auth.js", type: "blob" },
        { path: "docs", type: "tree" }
      ]
    });
  };

  const result = await executeAllowlistedTask("repository_inventory", env, fetchImpl);
  assert.equal(result.tracked_file_count, 3);
  assert.equal(result.default_branch, "main");
  assert.deepEqual(result.top_level_directories, ["src"]);
  assert.equal(result.file_extensions.ts, 1);
  assert.equal(result.file_extensions.js, 1);
  assert.equal(calls.length, 2);
  assert.ok(calls.every((url) => url.startsWith("https://api.github.com/")));
});

test("documentation audit reports missing policy documents and CI evidence", async () => {
  let call = 0;
  const fetchImpl = async () => {
    call += 1;
    if (call === 1) return response({ default_branch: "main" });
    return response({
      tree: [
        { path: "README.md", type: "blob" },
        { path: ".github/workflows/test.yml", type: "blob" },
        { path: "src/index.ts", type: "blob" },
        { path: "tests/index.test.js", type: "blob" }
      ]
    });
  };

  const result = await executeAllowlistedTask("repository_documentation_audit", env, fetchImpl);
  assert.deepEqual(result.missing_documents, ["LICENSE", "CONTRIBUTING.md", "SECURITY.md"]);
  assert.equal(result.workflow_count, 1);
  assert.equal(result.test_file_count, 1);
  assert.equal(result.docs_directory_present, false);
});

test("rejects unsupported operations without making external requests", async () => {
  let called = false;
  await assert.rejects(
    executeAllowlistedTask("run_shell_command", env, async () => {
      called = true;
      throw new Error("must not be called");
    }),
    /Unsupported task operation/
  );
  assert.equal(called, false);
});

test("classifies GitHub rate limiting as a terminal task error", async () => {
  let call = 0;
  const fetchImpl = async () => {
    call += 1;
    if (call === 1) return response({ default_branch: "main" });
    return response({}, 429);
  };

  await assert.rejects(
    executeAllowlistedTask("repository_inventory", env, fetchImpl),
    RateLimitExceededError
  );
});

test("rejects invalid repository configuration before any network request", async () => {
  let called = false;
  await assert.rejects(
    executeAllowlistedTask("repository_inventory", {
      ...env,
      GITHUB_REPOSITORY: "owner/repo/extra"
    }, async () => {
      called = true;
      return response({});
    }),
    /Repository configuration is invalid/
  );
  assert.equal(called, false);
});

test("recovers the complete inventory when GitHub truncates the recursive tree", async () => {
  const requestedUrls = [];
  const fetchImpl = async (url) => {
    const parsed = new URL(String(url));
    requestedUrls.push(parsed.pathname + parsed.search);

    if (parsed.pathname === "/repos/zopair/Zubair_AI_Army") {
      return response({ default_branch: "main" });
    }
    if (parsed.pathname.endsWith("/git/trees/main") && parsed.search === "?recursive=1") {
      return response({
        sha: "root-sha",
        truncated: true,
        tree: [{ path: "README.md", type: "blob" }]
      });
    }
    if (parsed.pathname.endsWith("/git/trees/root-sha")) {
      return response({
        truncated: false,
        tree: [
          { path: "README.md", type: "blob" },
          { path: "src", type: "tree", sha: "src-sha" }
        ]
      });
    }
    if (parsed.pathname.endsWith("/git/trees/src-sha")) {
      return response({
        truncated: false,
        tree: [{ path: "index.ts", type: "blob" }]
      });
    }
    throw new Error(`Unexpected GitHub API request: ${parsed.pathname}${parsed.search}`);
  };

  const result = await executeAllowlistedTask("repository_inventory", env, fetchImpl);

  assert.equal(result.tracked_file_count, 2);
  assert.deepEqual(result.top_level_directories, ["src"]);
  assert.equal(result.tree_truncated, false);
  assert.equal(result.tree_recovered_from_truncation, true);
  assert.ok(requestedUrls.some((url) => url.endsWith("/git/trees/root-sha")));
  assert.ok(requestedUrls.some((url) => url.endsWith("/git/trees/src-sha")));
});


test("enforces a shared 50-request budget across recursive tree recovery", async () => {
  let calls = 0;
  const childTrees = Array.from({ length: 60 }, (_, index) => ({
    path: `dir-${index}`,
    type: "tree",
    sha: `tree-${index}`
  }));
  const fetchImpl = async (url) => {
    calls += 1;
    const parsed = new URL(String(url));
    if (parsed.pathname === "/repos/zopair/Zubair_AI_Army") {
      return response({ default_branch: "main" });
    }
    if (parsed.pathname.endsWith("/git/trees/main") && parsed.search === "?recursive=1") {
      return response({ sha: "root-sha", truncated: true, tree: [] });
    }
    if (parsed.pathname.endsWith("/git/trees/root-sha")) {
      return response({ truncated: false, tree: childTrees });
    }
    return response({ truncated: false, tree: [] });
  };

  await assert.rejects(
    executeAllowlistedTask("repository_inventory", env, fetchImpl),
    RequestBudgetExceededError
  );
  assert.equal(calls, 50);
});
