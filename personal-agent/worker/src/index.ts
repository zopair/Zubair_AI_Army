import { constantTimeBearerTokenMatches } from "./auth.js";
import { ALLOWED_OPERATIONS, executeAllowlistedTask, RetryableTaskError } from "./task_executor.js";

export interface Env {
  DB: D1Database;
  TASK_QUEUE: Queue<{ task_id: string; operation: string }>;
  API_TOKEN: string;
  GITHUB_TOKEN: string;
  GITHUB_REPOSITORY: string;
}

type TaskMessage = { task_id: string; operation: string };

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function authorized(request: Request, env: Env): boolean {
  return constantTimeBearerTokenMatches(request.headers.get("authorization"), env.API_TOKEN);
}

async function updateTask(
  env: Env,
  taskId: string,
  status: "queued" | "completed" | "failed",
  result: string | null,
  error: string | null
): Promise<void> {
  await env.DB.prepare(
    "UPDATE tasks SET status=?, result=?, error=?, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?"
  ).bind(status, result, error, taskId).run();
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      return json({ ok: true, service: "personal-ai-agent-engine" });
    }
    if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);

    if (request.method === "POST" && url.pathname === "/api/tasks") {
      let body: Record<string, unknown>;
      try {
        const rawBody = await request.text();
        if (rawBody.length > 1024) return json({ error: "Request body too large" }, 413);
        const parsed: unknown = JSON.parse(rawBody);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          return json({ error: "Request body must be a JSON object" }, 400);
        }
        body = parsed as Record<string, unknown>;
      } catch {
        return json({ error: "Invalid JSON" }, 400);
      }

      if (typeof body.operation !== "string" || !ALLOWED_OPERATIONS.includes(body.operation)) {
        return json({
          error: "Unsupported operation",
          allowed_operations: ALLOWED_OPERATIONS
        }, 400);
      }

      const idempotencyKey = request.headers.get("idempotency-key");
      if (idempotencyKey !== null && !/^[\x21-\x7E]{8,128}$/.test(idempotencyKey)) {
        return json({ error: "Invalid Idempotency-Key header" }, 400);
      }

      const operation = body.operation;

      if (idempotencyKey !== null) {
        const existing = await env.DB.prepare(
          "SELECT id, operation, status FROM tasks WHERE idempotency_key=?"
        ).bind(idempotencyKey).first();

        if (existing) {
          if (existing.operation !== operation) {
            return json({ error: "Idempotency key already used for another operation" }, 409);
          }
          return json({
            task_id: existing.id,
            operation: existing.operation,
            status: existing.status
          }, 200);
        }
      }

      let rateLimit;
      try {
        rateLimit = await env.DB.prepare(
          "INSERT INTO api_rate_limits (bucket, window_started_at, request_count) VALUES ('task_submission', unixepoch(), 1) ON CONFLICT(bucket) DO UPDATE SET request_count = CASE WHEN api_rate_limits.window_started_at <= unixepoch() - 60 THEN 1 ELSE MIN(api_rate_limits.request_count + 1, 21) END, window_started_at = CASE WHEN api_rate_limits.window_started_at <= unixepoch() - 60 THEN unixepoch() ELSE api_rate_limits.window_started_at END RETURNING request_count, window_started_at"
        ).first();
      } catch {
        return json({ error: "Task intake limiter unavailable" }, 503);
      }

      if (!rateLimit || typeof rateLimit.request_count !== "number" || typeof rateLimit.window_started_at !== "number") {
        return json({ error: "Task intake limiter unavailable" }, 503);
      }

      if (rateLimit.request_count > 20) {
        const elapsedSeconds = Math.floor(Date.now() / 1000) - rateLimit.window_started_at;
        return json({
          error: "Task submission rate limit exceeded",
          retry_after_seconds: Math.max(1, 60 - elapsedSeconds)
        }, 429);
      }

      const id = crypto.randomUUID();
      const insert = await env.DB.prepare(
        "INSERT INTO tasks (id, task_text, operation, idempotency_key, status) VALUES (?, ?, ?, ?, 'queued') ON CONFLICT(idempotency_key) DO NOTHING"
      ).bind(id, operation, operation, idempotencyKey).run();

      if (idempotencyKey !== null && insert.meta?.changes === 0) {
        const existing = await env.DB.prepare(
          "SELECT id, operation, status FROM tasks WHERE idempotency_key=?"
        ).bind(idempotencyKey).first();

        if (!existing) return json({ error: "Unable to resolve idempotent task request" }, 503);
        if (existing.operation !== operation) {
          return json({ error: "Idempotency key already used for another operation" }, 409);
        }
        return json({
          task_id: existing.id,
          operation: existing.operation,
          status: existing.status
        }, 200);
      }

      try {
        await env.TASK_QUEUE.send({ task_id: id, operation });
      } catch {
        await updateTask(env, id, "failed", null, "Queue unavailable");
        return json({ error: "Queue unavailable", task_id: id }, 503);
      }

      return json({ task_id: id, operation, status: "queued" }, 202);
    }

    const match = url.pathname.match(/^\/api\/tasks\/([0-9a-f-]{36})$/i);
    if (request.method === "GET" && match) {
      const row = await env.DB.prepare(
        "SELECT id, task_text, operation, status, result, error, created_at, updated_at FROM tasks WHERE id=?"
      ).bind(match[1]).first();
      return row ? json(row) : json({ error: "Task not found" }, 404);
    }

    return json({ error: "Not found" }, 404);
  },

  async queue(batch: MessageBatch<TaskMessage>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      const { task_id: taskId, operation } = message.body;
      try {
        const result = await executeAllowlistedTask(operation, env);
        await updateTask(env, taskId, "completed", JSON.stringify(result), null);
        message.ack();
      } catch (error) {
        const retryable = error instanceof RetryableTaskError;
        const attemptsExhausted = message.attempts >= 3;
        if (retryable && !attemptsExhausted) {
          await updateTask(env, taskId, "queued", null, "Temporary GitHub API failure; retry scheduled");
          message.retry({ delaySeconds: 30 });
          continue;
        }

        const safeMessage = error instanceof Error ? error.message : "Task execution failed";
        await updateTask(env, taskId, "failed", null, safeMessage);
        message.ack();
      }
    }
  }
};
