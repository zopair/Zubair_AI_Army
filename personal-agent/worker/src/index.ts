export interface Env {
  DB: D1Database;
  TASK_QUEUE: Queue<{ task_id: string; task_text: string }>;
  API_TOKEN: string;
  GITHUB_TOKEN: string;
  GITHUB_REPOSITORY: string;
}

type TaskMessage = { task_id: string; task_text: string };

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}

function authorized(request: Request, env: Env): boolean {
  const supplied = request.headers.get("authorization") || "";
  const expected = `Bearer ${env.API_TOKEN}`;
  return supplied.length === expected.length && crypto.subtle.timingSafeEqual
    ? crypto.subtle.timingSafeEqual(new TextEncoder().encode(supplied), new TextEncoder().encode(expected))
    : supplied === expected;
}

async function dispatchToGitHub(env: Env, task: TaskMessage): Promise<void> {
  const [owner, repo] = env.GITHUB_REPOSITORY.split("/");
  if (!owner || !repo) throw new Error("Invalid GITHUB_REPOSITORY configuration");
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/personal-agent.yml/dispatches`, {
    method: "POST",
    headers: { authorization: `Bearer ${env.GITHUB_TOKEN}`, accept: "application/vnd.github+json", "content-type": "application/json", "x-github-api-version": "2022-11-28", "user-agent": "personal-ai-agent-engine" },
    body: JSON.stringify({ ref: "main", inputs: { task_id: task.task_id, task_text: task.task_text } })
  });
  if (!response.ok) throw new Error(`GitHub workflow dispatch failed (${response.status}): ${(await response.text()).slice(0, 500)}`);
  await env.DB.prepare("UPDATE tasks SET status='dispatched', updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?").bind(task.task_id).run();
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") return json({ ok: true, service: "personal-ai-agent-engine" });
    if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);

    if (request.method === "POST" && url.pathname === "/api/tasks") {
      let body: { task?: unknown };
      try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
      if (typeof body.task !== "string" || !body.task.trim() || body.task.length > 4000) return json({ error: "task must be 1-4000 characters" }, 400);
      const id = crypto.randomUUID();
      const task = body.task.trim();
      await env.DB.prepare("INSERT INTO tasks (id, task_text, status) VALUES (?, ?, 'queued')").bind(id, task).run();
      try { await env.TASK_QUEUE.send({ task_id: id, task_text: task }); }
      catch (error) { await env.DB.prepare("UPDATE tasks SET status='failed', error=?, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?").bind(String(error), id).run(); return json({ error: "Queue unavailable", task_id: id }, 503); }
      return json({ task_id: id, status: "queued" }, 202);
    }

    const match = url.pathname.match(/^\/api\/tasks\/([0-9a-f-]{36})$/i);
    if (request.method === "GET" && match) {
      const row = await env.DB.prepare("SELECT id, task_text, status, result, error, created_at, updated_at FROM tasks WHERE id=?").bind(match[1]).first();
      return row ? json(row) : json({ error: "Task not found" }, 404);
    }
    return json({ error: "Not found" }, 404);
  },

  async queue(batch: MessageBatch<TaskMessage>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      try { await dispatchToGitHub(env, message.body); message.ack(); }
      catch (error) {
        await env.DB.prepare("UPDATE tasks SET error=?, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?").bind(String(error), message.body.task_id).run();
        message.retry();
      }
    }
  }
};
