CREATE TABLE IF NOT EXISTS api_rate_limits (
    bucket TEXT PRIMARY KEY NOT NULL,
    window_started_at INTEGER NOT NULL,
    request_count INTEGER NOT NULL CHECK (request_count >= 0)
);
