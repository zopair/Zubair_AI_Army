# Zubair AI Army

[![Worker Tests](https://github.com/zopair/Zubair_AI_Army/actions/workflows/personal-agent-worker-tests.yml/badge.svg)](https://github.com/zopair/Zubair_AI_Army/actions/workflows/personal-agent-worker-tests.yml)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-339933.svg)](https://nodejs.org/)
[![Status](https://img.shields.io/badge/Status-PoC%20%2F%20MVP-orange.svg)](#proof-of-concept--enterprise-customization-readiness)

**A modular portfolio of AI-enabled product concepts, with a Cloudflare Worker that executes a small, explicit allowlist of read-only repository operations.**

This repository contains multiple product tracks at different levels of maturity. The descriptions below distinguish implemented components from planned or incomplete work; a product label or roadmap entry is not evidence of a finished agent or production service.

## Business problem

AI product experiments often become fragmented across repositories, scripts, and workflow prototypes. Without clear boundaries, repeatable validation, and a visible execution contract, it is difficult to identify what is operational, what is reusable, and what still needs engineering.

## Solution

Zubair AI Army is a portfolio workspace for consolidating product experiments and reusable automation components. Its current executable slice is a Cloudflare Worker that validates an allowlisted operation, stores it in D1, queues execution, reads repository metadata through the GitHub API, and persists a bounded JSON result.

## Current architecture

```mermaid
flowchart TD
    Client[Authorized Client] --> Worker[Cloudflare Worker]
    Worker --> Auth[Bearer Token Validation]
    Auth --> D1[(Cloudflare D1)]
    Worker --> Queue[Cloudflare Queue]
    Queue --> Allowlist[Fixed Read-only Task Executor]
    Allowlist --> GitHub[GitHub REST API]
    Allowlist --> D1
    D1 --> Client
```

**Execution boundary:** the executor accepts only `repository_inventory` and `repository_documentation_audit`. Both operations read repository metadata and tracked paths; they do not run user-supplied shell commands, modify repositories, or invoke an LLM. GitHub API rate limits and transient failures receive bounded queue retries.

## Portfolio status

| Track | Intended direction | Verified status |
|---|---|---|
| V1 — Production Radar | Repository and API security analysis | Concept area; not verified as a complete product |
| V2 — Intelligent Commerce | Commerce and pricing automation | Concept area; not verified as a complete product |
| V3 — Sovereign Core | Shared agent and platform foundations | Partial experiments; requires component-level audit |
| V4 — Elite Pro Builder | AI-enabled professional services | Incomplete prototype; do not treat as launch-ready |
| Personal Agent Worker | Task intake, D1 persistence, queue, allowlisted repository analysis | Implemented in this branch; execution tests and D1 migrations included |

## Quick start — Personal Agent Worker

### Prerequisites

- Cloudflare account with Workers, D1, and Queues enabled
- Node.js 22+
- Wrangler CLI
- A GitHub token or GitHub App token with read-only `Contents` access to the configured repository

### Configure

1. Create a D1 database named `personal-agent-db` and a Queue named `personal-agent-tasks`.
2. Replace the `database_id` placeholder in `personal-agent/worker/wrangler.toml` with the D1 database ID.
3. Apply the migration:

```bash
cd personal-agent/worker
wrangler d1 migrations apply personal-agent-db --remote
```

4. Configure secrets without committing them:

```bash
wrangler secret put API_TOKEN
wrangler secret put GITHUB_TOKEN
```

The non-secret `GITHUB_REPOSITORY` setting is declared in `wrangler.toml`. The GitHub token is used only for read-only repository metadata and Git tree requests.

### Run locally and deploy

```bash
cd personal-agent/worker
wrangler dev
# Deploy only after the D1 binding, queue, and secrets are configured:
wrangler deploy
```

### API contract

- `GET /health` — unauthenticated liveness response.
- `POST /api/tasks` — accepts JSON `{"operation":"repository_inventory"}` or `{"operation":"repository_documentation_audit"}`, requires `Authorization: Bearer <API_TOKEN>`, and rejects every operation outside this fixed allowlist.
- `GET /api/tasks/{task_id}` — returns the persisted task record, typed operation, execution status, and JSON result; requires the same bearer token.

Do not expose this prototype publicly without rate limiting, abuse controls, an operational error policy, and a reviewed authorization model.

## Development and tests

The worker's focused tests use Node.js built-ins and Python's standard library; no paid service or third-party test framework is required.

```bash
cd personal-agent/worker
npm test
python -m unittest discover -s tests -v
```

The tests cover bearer-token matching, allowlist enforcement, GitHub API retry classification, repository inventory and documentation audit behavior, and all D1 schema migrations. They do not replace a live Cloudflare deployment test.

## Proof of Concept & Enterprise Customization Readiness

| Area | Current status |
|---|---|
| Worker authentication | Fixed-work byte comparison helper; JavaScript runtime does not guarantee formal constant-time execution |
| Task intake | Implemented with strict operation allowlist and D1 persistence |
| Queue execution | Implemented with bounded retries for transient GitHub API failures |
| Supported operations | Repository inventory and documentation/CI evidence audit; read-only |
| Result lifecycle | Results and terminal status persisted in D1 and returned by task lookup |
| Arbitrary shell / write operations | Explicitly unsupported |
| LLM execution | Not connected to a deployed inference endpoint; provider router exists separately |
| Rate limiting and abuse protection | API-level rate limiting remains to be added |
| Enterprise identity / tenant isolation | Not implemented |
| Product tracks V1–V4 | Mixed maturity; require separate audits and acceptance criteria |

**Release posture:** Proof of Concept / MVP. The worker can now execute bounded read-only repository tasks. It is not a general-purpose autonomous agent and should not be exposed publicly until rate limiting, abuse controls, tenant isolation, operational monitoring, and deployment-level tests are added.

## Roadmap

- [ ] Implement an allowlisted task execution contract with explicit approval gates.
- [ ] Add worker-to-runner completion callbacks and durable terminal task states.
- [ ] Add bounded retries, rate limiting, idempotency, and operational metrics.
- [ ] Audit each V1–V4 track independently before describing it as launch-ready.
- [ ] Define a clear open-source or proprietary license before external redistribution.

## Intellectual Property & Authorship

Project authorship and attribution: **Aly Hussein Zopair (علي حسين زبير ALY HUSSEIN ZOPAIR)**.

No root-level `LICENSE` file was found in the repository at the time of this update. Redistribution and third-party contribution terms therefore remain unspecified; add an explicit license before external distribution. This authorship notice does not replace a legal license or transfer third-party rights.

## Portfolio samples

These are clearly labelled demonstration assets prepared for an Upwork application; they are not represented as past client work.

- [Sample 1 — Insurance Advisory (EN/AR)](./sample-1-insurance-advisory/)
- [Sample 2 — Arabic-first Business (AR/EN)](./sample-2-arabic-first/)
- [Documentation and handover](./docs/)
- [Project report](./docs/REPORT.md)
