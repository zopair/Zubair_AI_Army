# Execution Vertical Slice

Phase 1 implements a provider-neutral deterministic task boundary.

Flow:
1. Validate task contract.
2. Enforce command allowlist.
3. Execute with captured stdout/stderr and exit code.
4. Return a deterministic result object.

The runner is intentionally small. Dagger, `act`, and other providers will implement the same contract rather than becoming business-logic dependencies.

No network, payment, credential, browser, or production deployment actions are enabled by this slice.
