import test from "node:test";
import assert from "node:assert/strict";
import worker from "./index.ts";

class MockDB {
  constructor(row = null) {
    this.row = row;
    this.rows = new Map(row ? [[row.id, row]] : []);
    this.calls = [];
    this.rateLimitCount = 0;
    this.rateLimitWindowStartedAt = null;
    this.failRateLimit = false;
  }

  prepare(sql) {
    const db = this;
    const statement = (values = []) => ({
      async run() {
        db.calls.push({ sql, values });
        if (/INSERT INTO tasks/.test(sql)) {
          const [id, taskText, operation, idempotencyKey] = values;
          if (idempotencyKey && [...db.rows.values()].some((item) => item.idempotency_key === idempotencyKey)) {
            return { success: true, meta: { changes: 0 } };
          }
          db.rows.set(id, { id, task_text: taskText, operation, idempotency_key: idempotencyKey, status: "queued" });
          return { success: true, meta: { changes: 1 } };
        }
        return { success: true, meta: { changes: 1 } };
      },
      async first() {
        db.calls.push({ sql, values });
        if (/INSERT INTO api_rate_limits/.test(sql)) {
          if (db.failRateLimit) throw new Error("D1 unavailable");
          if (db.rateLimitWindowStartedAt === null) db.rateLimitWindowStartedAt = Math.floor(Date.now() / 1000);
          db.rateLimitCount = Math.min(db.rateLimitCount + 1, 21);
          return { request_count: db.rateLimitCount, window_started_at: db.rateLimitWindowStartedAt };
        }
        if (sql.includes("idempotency_key=?")) {
          return [...db.rows.values()].find((item) => item.idempotency_key === values[0]) || null;
        }
        if (sql.includes("WHERE id=?")) return db.rows.get(values[0]) || db.row;
        return db.row;
      }
    });
    return {
      ...statement(),
      bind(...values) {
        return statement(values);
      }
    };
  }
}
function env(overrides = {}) {
  const bindings = {
    DB: new MockDB(),
    API_TOKEN: "test-api-token",
    GITHUB_TOKEN: "test-github-token",
    GITHUB_REPOSITORY: "zopair/Zubair_AI_Army",
    ...overrides
  };
  bindings.TASK_QUEUE_MESSAGES = [];
  bindings.TASK_QUEUE = {
    send: async (message) => { bindings.lastMessage = message; bindings.TASK_QUEUE_MESSAGES.push(message); }
  };
  return bindings;
}

function request(path, { method = "GET", body, token = "test-api-token", headers = {} } = {}) {
  return new Request(`https://worker.example${path}`, {
    method,
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
      ...headers
    },
    ...(body !== undefined ? { body } : {})
  });
}

test("health endpoint is public and does not access D1", async () => {
  const bindings = env();
  const response = await worker.fetch(request("/health", { token: null }), bindings);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    ok: true,
    service: "personal-ai-agent-engine"
  });
  assert.equal(bindings.DB.calls.length, 0);
});

test("task submission accepts only allowlisted operations and enqueues a typed message", async () => {
  const bindings = env();
  const response = await worker.fetch(request("/api/tasks", {
    method: "POST",
    body: JSON.stringify({ operation: "repository_inventory" })
  }), bindings);

  assert.equal(response.status, 202);
  const payload = await response.json();
  assert.equal(payload.operation, "repository_inventory");
  assert.equal(payload.status, "queued");
  assert.equal(bindings.lastMessage.operation, "repository_inventory");
  assert.equal(bindings.lastMessage.task_id, payload.task_id);
  assert.ok(bindings.DB.calls.some((call) => /INSERT INTO tasks/.test(call.sql)));
});

test("task submission rejects malformed, oversized, and unsupported payloads", async () => {
  const bindings = env();
  const malformed = await worker.fetch(request("/api/tasks", {
    method: "POST",
    body: "not-json"
  }), bindings);
  assert.equal(malformed.status, 400);

  const primitive = await worker.fetch(request("/api/tasks", {
    method: "POST",
    body: "null"
  }), bindings);
  assert.equal(primitive.status, 400);

  const unsupported = await worker.fetch(request("/api/tasks", {
    method: "POST",
    body: JSON.stringify({ operation: "run_shell_command" })
  }), bindings);
  assert.equal(unsupported.status, 400);

  const oversized = await worker.fetch(request("/api/tasks", {
    method: "POST",
    body: JSON.stringify({ operation: "x".repeat(1100) })
  }), bindings);
  assert.equal(oversized.status, 413);
  assert.equal(bindings.lastMessage, undefined);
});

test("all task routes reject missing or invalid bearer tokens", async () => {
  const bindings = env();
  const response = await worker.fetch(request("/api/tasks", {
    method: "POST",
    body: JSON.stringify({ operation: "repository_inventory" }),
    token: "wrong-token"
  }), bindings);
  assert.equal(response.status, 401);
  assert.equal(bindings.DB.calls.length, 0);
});

test("task lookup returns persisted operation and result", async () => {
  const bindings = env({
    DB: new MockDB({
      id: "12345678-1234-1234-1234-123456789012",
      operation: "repository_inventory",
      status: "completed",
      result: JSON.stringify({ tracked_file_count: 3 }),
      error_code: null
    })
  });
  const response = await worker.fetch(request("/api/tasks/12345678-1234-1234-1234-123456789012"), bindings);
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.status, "completed");
  assert.equal(payload.operation, "repository_inventory");
  assert.equal(payload.error_code, null);
});

test("queue execution persists completed result and acknowledges the message", async () => {
  const bindings = env();
  const originalFetch = globalThis.fetch;
  let fetchCall = 0;
  globalThis.fetch = async () => {
    fetchCall += 1;
    if (fetchCall === 1) return new Response(JSON.stringify({ default_branch: "main" }));
    return new Response(JSON.stringify({
      truncated: false,
      tree: [{ path: "README.md", type: "blob" }, { path: "src/index.ts", type: "blob" }]
    }));
  };

  let acknowledged = false;
  let retried = false;
  try {
    await worker.queue({
      messages: [{
        body: { task_id: "12345678-1234-1234-1234-123456789012", operation: "repository_inventory" },
        attempts: 1,
        ack() { acknowledged = true; },
        retry() { retried = true; }
      }]
    }, bindings);
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.equal(acknowledged, true);
  assert.equal(retried, false);
  const update = bindings.DB.calls.find((call) => /UPDATE tasks/.test(call.sql));
  assert.ok(update);
  assert.equal(update.values[0], "completed");
  const result = JSON.parse(update.values[1]);
  assert.equal(result.tracked_file_count, 2);
});

test("idempotency key returns the original queued task without a second queue message", async () => {
  const bindings = env();
  const first = await worker.fetch(request("/api/tasks", {
    method: "POST",
    headers: { "idempotency-key": "request-12345" },
    body: JSON.stringify({ operation: "repository_inventory" })
  }), bindings);
  const firstPayload = await first.json();

  const second = await worker.fetch(request("/api/tasks", {
    method: "POST",
    headers: { "idempotency-key": "request-12345" },
    body: JSON.stringify({ operation: "repository_inventory" })
  }), bindings);
  const secondPayload = await second.json();

  assert.equal(first.status, 202);
  assert.equal(second.status, 200);
  assert.equal(secondPayload.task_id, firstPayload.task_id);
  assert.equal(bindings.TASK_QUEUE_MESSAGES.length, 1);
});

test("idempotency key cannot be reused for a different operation", async () => {
  const bindings = env();
  await worker.fetch(request("/api/tasks", {
    method: "POST",
    headers: { "idempotency-key": "request-12345" },
    body: JSON.stringify({ operation: "repository_inventory" })
  }), bindings);

  const conflict = await worker.fetch(request("/api/tasks", {
    method: "POST",
    headers: { "idempotency-key": "request-12345" },
    body: JSON.stringify({ operation: "repository_documentation_audit" })
  }), bindings);

  assert.equal(conflict.status, 409);
  assert.deepEqual(await conflict.json(), { error: "Idempotency key already used for another operation" });
});

test("rejects malformed idempotency keys before writing or enqueueing", async () => {
  const bindings = env();
  const response = await worker.fetch(request("/api/tasks", {
    method: "POST",
    headers: { "idempotency-key": "bad key" },
    body: JSON.stringify({ operation: "repository_inventory" })
  }), bindings);

  assert.equal(response.status, 400);
  assert.equal(bindings.DB.calls.length, 0);
  assert.equal(bindings.TASK_QUEUE_MESSAGES.length, 0);
});

test("task intake is capped at 20 accepted submissions per 60-second owner window", async () => {
  const bindings = env();
  const submit = () => worker.fetch(request("/api/tasks", {
    method: "POST",
    body: JSON.stringify({ operation: "repository_inventory" })
  }), bindings);

  const responses = [];
  for (let i = 0; i < 21; i += 1) responses.push(await submit());

  assert.equal(responses.slice(0, 20).every((response) => response.status === 202), true);
  assert.equal(responses[20].status, 429);
  const limitedPayload = await responses[20].json();
  assert.equal(limitedPayload.error, "Task submission rate limit exceeded");
  assert.equal(Number.isInteger(limitedPayload.retry_after_seconds), true);
  assert.ok(limitedPayload.retry_after_seconds >= 1 && limitedPayload.retry_after_seconds <= 60);
  assert.equal(bindings.TASK_QUEUE_MESSAGES.length, 20);
});

test("idempotent replay returns existing task without consuming intake quota", async () => {
  const bindings = env();
  const options = {
    method: "POST",
    headers: { "idempotency-key": "stable-key-123" },
    body: JSON.stringify({ operation: "repository_inventory" })
  };
  const first = await worker.fetch(request("/api/tasks", options), bindings);
  const second = await worker.fetch(request("/api/tasks", options), bindings);

  assert.equal(first.status, 202);
  assert.equal(second.status, 200);
  assert.equal(bindings.DB.rateLimitCount, 1);
  assert.equal(bindings.TASK_QUEUE_MESSAGES.length, 1);
});

test("task intake fails closed when the D1 rate limiter is unavailable", async () => {
  const bindings = env();
  bindings.DB.failRateLimit = true;
  const response = await worker.fetch(request("/api/tasks", {
    method: "POST",
    body: JSON.stringify({ operation: "repository_inventory" })
  }), bindings);

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "Task intake limiter unavailable" });
  assert.equal(bindings.TASK_QUEUE_MESSAGES.length, 0);
});

test("queue persists a stable error code when GitHub rate limits a task", async () => {
  const bindings = env();
  const originalFetch = globalThis.fetch;
  let fetchCall = 0;
  globalThis.fetch = async () => {
    fetchCall += 1;
    if (fetchCall === 1) return new Response(JSON.stringify({ default_branch: "main" }));
    return new Response("{}", { status: 429 });
  };

  let acknowledged = false;
  try {
    await worker.queue({
      messages: [{
        body: { task_id: "12345678-1234-1234-1234-123456789012", operation: "repository_inventory" },
        attempts: 1,
        ack() { acknowledged = true; },
        retry() { throw new Error("Rate-limited tasks must not retry"); }
      }]
    }, bindings);
  } finally {
    globalThis.fetch = originalFetch;
  }

  const update = bindings.DB.calls.find((call) => /UPDATE tasks/.test(call.sql));
  assert.equal(acknowledged, true);
  assert.ok(update);
  assert.equal(update.values[0], "failed");
  assert.equal(update.values[3], "GITHUB_RATE_LIMITED");
});

test("queue records request-budget exhaustion as a distinct terminal diagnostic", async () => {
  const bindings = env();
  const originalFetch = globalThis.fetch;
  let fetchCall = 0;
  globalThis.fetch = async () => {
    fetchCall += 1;
    if (fetchCall === 1) return new Response(JSON.stringify({ default_branch: "main" }));
    if (fetchCall === 2) return new Response(JSON.stringify({ truncated: true, sha: "root-sha", tree: [] }));
    if (fetchCall === 3) {
      return new Response(JSON.stringify({
        truncated: false,
        tree: Array.from({ length: 60 }, (_, index) => ({
          path: `directory-${index}`,
          type: "tree",
          sha: `tree-${index}`
        }))
      }));
    }
    return new Response(JSON.stringify({ truncated: false, tree: [] }));
  };

  let acknowledged = false;
  try {
    await worker.queue({
      messages: [{
        body: { task_id: "12345678-1234-1234-1234-123456789012", operation: "repository_inventory" },
        attempts: 1,
        ack() { acknowledged = true; },
        retry() { throw new Error("Budget exhaustion must not retry"); }
      }]
    }, bindings);
  } finally {
    globalThis.fetch = originalFetch;
  }

  const update = bindings.DB.calls.find((call) => /UPDATE tasks/.test(call.sql));
  assert.equal(acknowledged, true);
  assert.ok(update);
  assert.equal(update.values[0], "failed");
  assert.equal(update.values[3], "GITHUB_REQUEST_BUDGET_EXCEEDED");
});
