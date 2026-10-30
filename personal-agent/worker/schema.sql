CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  task_text TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued','dispatched','running','completed','failed')) DEFAULT 'queued',
  github_run_id TEXT,
  result TEXT,
  error TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
