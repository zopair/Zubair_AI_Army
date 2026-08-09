# ZOPAIR Infrastructure Fabric

## Purpose
Provide a provider-neutral execution layer so the swarm is not dependent on GitHub Actions, a single VM, or a single browser automation provider.

## Layers

1. **Orchestrator** — chooses a backend from a declarative task contract.
2. **Execution** — Dagger/containerized tasks; local `act` fallback for GitHub Actions-compatible workflows.
3. **CI** — GitHub Actions as primary integration path; Woodpecker as independent CI fallback.
4. **Workspace** — DevPod/Coder-compatible remote workspaces; Docker/local development remains supported.
5. **Browser** — provider adapter boundary; Browser Use/Stagehand/WebAgent are evaluated behind the same contract.
6. **Observability** — structured audit events and OpenTelemetry-compatible traces when enabled.

## Phase 1: Foundation

- No provider is hard-required by application code.
- All infrastructure choices are represented as adapters/contracts.
- Secrets remain external to Git.
- Production financial actions remain approval-gated.
- Public/untrusted pull requests must never execute on privileged self-hosted infrastructure.

## Phase 2: Execution

Implement and benchmark each adapter using the same fixtures:
- Dagger execution
- local `act` workflow replay
- Woodpecker CI
- DevPod/Coder workspace provisioning
- Browser adapter

Selection criteria: reliability, cold-start latency, resource use, reproducibility, isolation, operational complexity, and cost.

## Phase 3: Production

Promote only components that pass the benchmark and security gates. Keep at least one independent execution path available for recovery.
