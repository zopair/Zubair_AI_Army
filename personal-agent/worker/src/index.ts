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
      let body: { operation?: unknown };
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid JSON" }, 400);
      }

      if (typeof body.operation !== "string" || !ALLOWED_OPERATIONS.includes(body.operation)) {
        return json({
          error: "Unsupported operation",
          allowed_operations: ALLOWED_OPERATIONS
        }, 400);
      }

      const id = crypto.randomUUID();
      const operation = body.operation;
      await env.DB.prepare(
        "INSERT INTO tasks (id, task_text, operation, status) VALUES (?, ?, ?, 'queued')"
      ).bind(id, operation, operation).run();

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
