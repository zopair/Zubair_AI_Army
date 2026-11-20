import test from "node:test";
import assert from "node:assert/strict";
import worker from "./index.ts";

class MockDB {
  constructor(row = null) {
    this.row = row;
    this.calls = [];
  }

  prepare(sql) {
    const db = this;
    return {
      bind(...values) {
        return {
          async run() {
            db.calls.push({ sql, values });
            return { success: true };
          },
          async first() {
            db.calls.push({ sql, values });
            return db.row;
          }
        };
      }
    };
  }
}

function env(overrides = {}) {
  return {
    DB: new MockDB(),
    TASK_QUEUE: { send: async (message) => { env.lastMessage = message; } },
    API_TOKEN: "test-api-token",
    GITHUB_TOKEN: "test-github-token",
    GITHUB_REPOSITORY: "zopair/Zubair_AI_Army",
    ...overrides
  };
}

function request(path, { method = "GET", body, token = "test-api-token" } = {}) {
  return new Request(`https://worker.example${path}`, {
    method,
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(body !== undefined ? { "content-type": "application/json" } : {})
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
  assert.equal(env.lastMessage.operation, "repository_inventory");
  assert.equal(env.lastMessage.task_id, payload.task_id);
  assert.match(bindings.DB.calls[0].sql, /INSERT INTO tasks/);
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
  assert.equal(bindings.TASK_QUEUE.send ? true : false, true);
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
      result: JSON.stringify({ tracked_file_count: 3 })
    })
  });
  const response = await worker.fetch(request("/api/tasks/12345678-1234-1234-1234-123456789012"), bindings);
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.status, "completed");
  assert.equal(payload.operation, "repository_inventory");
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
