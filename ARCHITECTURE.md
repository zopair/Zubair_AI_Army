# Zubair AI Army — Architecture

## Status and scope

This document distinguishes the repository's **declared direction** from behavior
that has been demonstrated by executable code. A directory name or product claim
is not, by itself, proof that a service is implemented or production-ready.

The README describes four product areas:

- **V1 — Production Radar:** API and application-security assessment.
- **V2 — Intelligent Dropshipping:** commerce automation and pricing.
- **V3 — Sovereign Core:** orchestration, policy enforcement, and protected operations.
- **V4 — Elite Pro Builder:** AI-assisted professional services.

Shared capabilities named by the repository include security, memory, and financial
monitoring. Their exact runtime boundaries and integration contracts must be
confirmed against the implementation before they are treated as deployed services.

## Target architecture

The intended long-term shape is a modular system with the following boundaries:

1. **Control plane:** accepts a task, validates its requested capability, applies
   policy, selects an agent, and tracks lifecycle state.
2. **Agent adapters:** expose a common task contract while keeping each product
   area's implementation independently deployable.
3. **Policy and security layer:** least-privilege tool permissions, explicit
   approval gates for consequential actions, secret isolation, and audit events.
4. **Memory service:** separates task context from durable knowledge; records
   provenance and supports retention/deletion policies.
5. **Observability:** correlates task, agent, tool, and model events; measures
   latency, failures, and resource usage without logging secrets.
6. **Persistence and integrations:** accessed through explicit interfaces rather
   than direct cross-module database access.

## Minimum task contract

Every agent integration should eventually accept a versioned request containing:

- task_id: unique correlation identifier;
- agent: registered capability identifier;
- input: schema-validated task input;
- requested_permissions: bounded tool scopes;
- deadline: execution deadline;
- idempotency_key: duplicate-execution protection.

Every result should include the same task_id, a terminal status, structured output
or a typed error, timestamps, and an audit reference. Agents must not grant
themselves additional permissions.

## Security invariants

- Deny tool access unless explicitly granted for the task.
- Keep credentials out of source control, prompts, logs, and agent memory.
- Require human approval for external publication, spending, destructive changes,
  and other high-impact actions.
- Validate tool inputs and outputs at module boundaries.
- Make retries idempotent and bound execution time, output size, and resource use.
- Treat retrieved content and tool output as untrusted data, never as policy.

## Current verification boundary

The repository currently contains a minimal CI workflow that only prints a message.
The root Dockerfile attempts to install a Python requirements file while ignoring
installation failure, and then starts an interactive Python interpreter. The
README declares a TypeScript/Next.js/Bun stack, but a root package.json was not
present at the time this document was updated.

These are verification gaps, not assumptions to paper over. The repository
preflight workflow checks JSON validity and Python byte-compilation only. It does
**not** claim to type-check, test, or build the TypeScript application. Those jobs
should be added once the actual package/workspace manifests and supported build
commands are established.

## Next architecture milestones

1. Inventory actual executable entry points, package manifests, and deployment
   targets for V1–V4.
2. Define and version the agent request/result contract.
3. Implement the control plane with authorization and audit logging.
4. Add contract tests between the control plane and each agent.
5. Add integration, failure-recovery, and security tests.
6. Add per-task observability and cost/resource budgets.
