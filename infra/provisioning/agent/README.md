# Provisioning Agent Runtime

The runtime is a provider-neutral orchestration contract. It is designed to run on an authorized cloud computer with browser automation and an approved transactional mailbox.

## Adapter contract

Each adapter implements:

- `probe()` — verify availability and permissions without mutating state.
- `plan()` — produce a dry-run plan.
- `apply()` — perform only authorized, idempotent changes.
- `verify()` — verify the resulting state.
- `rollback()` — revert changes where the provider supports it.

## Execution order

1. Probe environment.
2. Build a dry-run plan.
3. Require explicit authorization for mutating provider state.
4. Apply idempotent configuration.
5. Verify every required health check.
6. Emit an audit record without credentials or session material.

## Browser automation

The adapter can use an approved browser automation runtime such as Browser Use or Playwright. Browser Use is a candidate integration, not a bundled dependency, until the runtime environment is provisioned and pinned.

Repository candidate: https://github.com/browser-use/browser-use

## Mail adapter

The mailbox adapter reads only transactional messages needed for authorized setup. It must not export the mailbox, credentials, cookies, recovery codes, or unrelated messages.

## Human checkpoints

Provider-controlled identity verification, CAPTCHA, legal acceptance, payment authorization, and recovery-code entry remain explicit checkpoints.
