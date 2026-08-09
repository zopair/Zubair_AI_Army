# ZOPAIR Agent Fabric Starter

A zero-dependency, provider-neutral execution starter for AI agents.

## What it solves
Agents submit one small task contract. The Fabric handles provider selection, retries, isolation policy, artifacts, and normalized results.

## Product model
- Community core: source-available/open-source project components in this repository.
- Paid service: installation, customization, workflow migration, and support.
- No paid runtime is required for the core smoke tests.

## Quick start

Requirements: Node.js 20+.

```bash
node infra/fabric/execution/task-runner.test.mjs
node infra/fabric/execution/provider-registry.test.mjs
node infra/fabric/execution/orchestrator.test.mjs
```

## Design
The agent does not depend on Dagger, GitHub Actions, Docker, or any single CI provider. Providers are replaceable.

## Safety
Never put credentials, recovery codes, cookies, payment secrets, or private keys in task definitions or Git.
