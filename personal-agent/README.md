# Personal AI Agent Engine

Private, single-owner assistant foundation inside `zopair/Zubair_AI_Army`.

## Phase 1
- Cloudflare Worker API with one personal bearer secret.
- D1 task persistence and Cloudflare Queue dispatch.
- GitHub Actions `workflow_dispatch` execution bridge.
- Minimal installable PWA shell.

This is an execution foundation, not yet an autonomous tool-discovery agent. Unknown repositories are never executed in this phase.

## Deploy
1. Create a D1 database and a Queue in Cloudflare.
2. Apply `worker/schema.sql` using `wrangler d1 execute <DB_NAME> --remote --file=worker/schema.sql`.
3. Set Worker secrets: `API_TOKEN` and `GITHUB_TOKEN` (fine-grained PAT restricted to this repository, Actions: read/write, Metadata: read).
4. Set `GITHUB_REPOSITORY=zopair/Zubair_AI_Army` as a Worker variable.
5. Deploy the Worker from `worker/` after setting the D1 and Queue bindings in `wrangler.toml`.
6. In the private repository, enable Actions and allow the workflow to run.

## API
`POST /api/tasks` with `Authorization: Bearer <API_TOKEN>` and JSON `{ "task": "..." }`.
`GET /api/tasks/:id` returns the persisted task state.

Never put `API_TOKEN` or `GITHUB_TOKEN` in the PWA. Use HTTPS only.
