ALTER TABLE tasks ADD COLUMN operation TEXT;
CREATE INDEX IF NOT EXISTS idx_tasks_operation_created_at
    ON tasks (operation, created_at);
