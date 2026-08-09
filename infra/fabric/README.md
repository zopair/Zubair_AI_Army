# Infrastructure Fabric

This directory is the infrastructure foundation for ZOPAIR ARMY.

## Current status

**Foundation phase only.** Provider adapters are registered as contracts; execution is deliberately not enabled yet.

## Planned execution order

1. Validate repository/task contracts.
2. Implement Dagger execution adapter.
3. Add local `act` replay for existing GitHub workflows.
4. Stand up an independent Woodpecker CI path.
5. Add DevPod/Coder workspace adapter.
6. Add browser adapter benchmark.
7. Run identical fixtures and select by measured results.
8. Promote the winning stack behind the orchestrator.

## Non-negotiables

- No secrets committed.
- No production credentials in benchmarks.
- No real financial movement during infrastructure tests.
- No privileged self-hosted execution for untrusted pull requests.
- Every provider must be replaceable without changing product/business logic.
