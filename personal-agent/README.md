# Personal AI Agent Engine

A private, single-owner task-processing prototype inside `zopair/Zubair_AI_Army`.

**Current status:** Proof of Concept. The repository contains a bounded read-only Worker task path; it is not yet a general-purpose autonomous agent.

## Implemented Worker path

- Cloudflare Worker exposes a small authenticated task API.
- D1 stores task status and results.
- Cloudflare Queue dispatches allowlisted work.
- The executor currently supports only:
  - `repository_inventory`
  - `repository_documentation_audit`
- Both operations read GitHub repository metadata and Git tree data. They do not read file contents, execute shell commands, modify repositories, or invoke an LLM.
- GitHub API calls have a 10-second timeout and classify rate limits, server failures, and network failures for bounded queue retry.

Unknown operations are rejected. Do not expand the allowlist to arbitrary shell, Python, or model-generated code.

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

A successful submission returns HTTP `202` with `task_id`, `operation`, and `status: "queued"`. Unsupported operations and malformed/oversized JSON are rejected.

### Read task status

```http
GET /api/tasks/<uuid>
```

Returns the persisted task fields, including status, result and error where present.

## Separate GitHub Actions workflow

`.github/workflows/personal-agent.yml` is a manual `workflow_dispatch` workflow. It accepts a task ID and task text, stores them as files, and uploads a short-retention artifact.

**It does not execute the task, call an LLM, dispatch the Cloudflare Queue, or act as a Worker completion callback.** Do not describe this workflow as an autonomous execution bridge.

## Configuration and deployment gate

The Worker configuration is in `worker/wrangler.toml`. Before any deployment:

1. Create and bind the required D1 database and Queue.
2. Replace the `REPLACE_WITH_D1_DATABASE_ID` placeholder with the actual D1 database ID.
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
- No API-level rate limiter, tenant isolation or idempotency key is implemented.
- The recursive-tree fallback now shares a 50-request ceiling across metadata, recursive-tree and fallback-tree calls. Rate-limit responses stop the task without a blind queue retry.
- The Worker configuration contains a D1 ID placeholder until deployment is deliberately configured.
- The root repository has no explicit `LICENSE` file on the audited default branch.

See [Agent Platform Research & Continuation Plan](../docs/AGENT_PLATFORM_RESEARCH.md) for the verified inventory, comparable-system research, red flags and prioritized next steps.

Never put `API_TOKEN` or `GITHUB_TOKEN` in the PWA, source code, logs or artifacts. Use HTTPS only.
