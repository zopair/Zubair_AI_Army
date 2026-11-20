# Personal AI Agent Engine

A private, single-owner task-processing prototype inside `zopair/Zubair_AI_Army`.

**Current status:** Proof of Concept. The repository contains a bounded read-only Worker task path; it is not yet a general-purpose autonomous agent.

## Implemented Worker path

- Cloudflare Worker exposes a small authenticated task API.
- D1 stores task status, results, stable error codes, and idempotency state.
- Cloudflare Queue dispatches allowlisted work with an atomic `queued` → `dispatched` claim; duplicate deliveries for already claimed or terminal tasks are acknowledged without repeating repository reads.
- A five-minute Cron Trigger recovers queued/dispatched tasks older than 20 minutes, covering lost deliveries and worker interruptions.
- The executor uses a small explicit capability registry and currently supports only:
  - `repository_inventory`
  - `repository_documentation_audit`
- Both operations read GitHub repository metadata and Git tree data. They do not read file contents, execute shell commands, modify repositories, or invoke an LLM.
- GitHub API calls have a 10-second timeout, disable automatic redirects, and classify rate limits, server failures, and network failures for bounded queue retry. The shared 50-request ceiling therefore also stays within the Workers Free external-subrequest cap.\n- Stale recovery scans at most 20 tasks per scheduled invocation (one D1 read plus at most 20 conditional updates), below the D1 Free per-invocation query ceiling.

Both registered capabilities are read-only and require no approval because they do not modify external state. Unknown operations are rejected. Any future write-capable capability must introduce an explicit approval path before it can be registered. Do not expand the registry to arbitrary shell, Python, or model-generated code.

## Actual API contract

All API paths other than `GET /health` require:

```http
Authorization: Bearer <API_TOKEN>
```

### Health

```http
GET /health
```

Returns a public liveness response. It does not prove that D1, Queue, GitHub credentials, or production deployment are healthy.

### Submit an allowlisted task

```http
POST /api/tasks
Content-Type: application/json
```

Supported body:

```json
{ "operation": "repository_inventory" }
```

Or:

```json
{ "operation": "repository_documentation_audit" }
```

A new successful submission returns HTTP `202` with `task_id`, `operation`, and `status: "queued"`. An optional `Idempotency-Key` header (8–128 visible ASCII characters) makes client retries safe: repeating the same key and operation returns the original task with HTTP `200` and does not enqueue duplicate work or consume another intake slot. Reusing a key for a different operation returns HTTP `409`. The single-owner intake is capped at 20 new valid submissions per fixed 60-second window; further submissions receive HTTP `429` with a retry hint. The counter is persisted atomically in D1 and fails closed with HTTP `503` if the limiter cannot be checked. Unsupported operations, malformed keys, and malformed/oversized JSON are rejected.

### Read task status

```http
GET /api/tasks/<uuid>
```

Returns the persisted task fields, including status, result, error and a stable `error_code` where present. Queue tasks use a 20-minute stale threshold and are scanned every five minutes (UTC); recovery is bounded to 20 tasks per scheduled invocation. Queue tasks use a 20-minute stale threshold and are scanned every five minutes (UTC); recovery is bounded to 20 tasks per scheduled invocation. Terminal diagnostics currently distinguish `GITHUB_RATE_LIMITED`, `GITHUB_REQUEST_BUDGET_EXCEEDED`, `TRANSIENT_GITHUB_FAILURE`, `QUEUE_UNAVAILABLE`, and generic `TASK_EXECUTION_FAILED` outcomes. Clients should branch on `error_code`, not parse the human-readable `error` message.

## Separate GitHub Actions workflow

`.github/workflows/personal-agent.yml` is a manual `workflow_dispatch` workflow. It accepts a task ID and task text, stores them as files, and uploads a short-retention artifact.

**It does not execute the task, call an LLM, dispatch the Cloudflare Queue, or act as a Worker completion callback.** Do not describe this workflow as an autonomous execution bridge.

## Configuration and deployment gate

The Worker configuration is in `worker/wrangler.toml`. Run the strict deployment preflight from the repository root before deployment:

```bash
python scripts/ci/preflight_worker_config.py
```

The checked-in template intentionally fails strict mode while the D1 ID is a placeholder. CI runs `python scripts/ci/preflight_worker_config.py --allow-placeholders` to validate structure, Queue wiring and the required five-minute recovery cron only; that mode is not deployment approval. Before any deployment:

1. Create and bind the required D1 database and Queue.
2. Replace the `REPLACE_WITH_D1_DATABASE_ID` placeholder with the actual D1 database ID; strict preflight also validates its UUID format and the configured migration directory.
3. Configure `API_TOKEN` and `GITHUB_TOKEN` as Worker secrets, never as committed variables or PWA values.
4. Confirm the configured GitHub token has only the read permissions required for repository metadata and Git tree access.
5. Apply the ordered SQL migrations from `worker/migrations/`.
6. Run the focused tests and verify a controlled deployment before exposing any endpoint.

No live Cloudflare resource, secret, D1 binding, Queue binding, or deployed endpoint is asserted by this repository documentation.

## Local tests

Requirements: Node.js 22+ and Python 3.11+.

```bash
cd personal-agent/worker
npm test
python -m unittest discover -s tests -v
```

The Node tests cover authentication, route validation, queue lifecycle and the allowlisted executor. Python tests apply the SQL migration chain to an in-memory SQLite database. These tests do not replace a live Cloudflare integration test.

## Current limitations

- No model inference provider is connected.
- No autonomous tool discovery or multi-agent orchestration exists.
- Task intake has a D1-backed single-owner limit of 20 new valid submissions per fixed 60-second window. This is not per-user or per-IP throttling; the prototype remains single-owner and does not provide tenant isolation. Idempotency is optional and scoped to a caller-provided request key.
- The recursive-tree fallback now shares a 50-request ceiling across metadata, recursive-tree and fallback-tree calls. Rate-limit responses stop the task without a blind queue retry.
- The Worker configuration contains a D1 ID placeholder until deployment is deliberately configured.
- The root repository has no explicit `LICENSE` file on the audited default branch.

See [Agent Platform Research & Continuation Plan](../docs/AGENT_PLATFORM_RESEARCH.md) for the verified inventory, comparable-system research, red flags and prioritized next steps.

Never put `API_TOKEN` or `GITHUB_TOKEN` in the PWA, source code, logs or artifacts. Use HTTPS only.
