ALTER TABLE tasks ADD COLUMN idempotency_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_idempotency_key
    ON tasks (idempotency_key);
