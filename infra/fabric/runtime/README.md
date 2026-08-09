# Runtime Fallbacks

The Fabric must not depend on one hosted CI environment.

Fallback order:
1. Dagger execution backend
2. local container runtime
3. act-compatible local CI execution
4. Woodpecker self-hosted CI
5. other approved runner providers selected by benchmark

GitHub Actions remains an integration target, not a single point of execution.

A backend is considered usable only after the smoke benchmark passes and the security policy is satisfied.
