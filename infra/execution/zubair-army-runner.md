# Zubair Army Execution Host

The repository now treats the existing **Zubair Army Runner** application as the preferred execution-host candidate for the swarm.

## Control plane / execution plane

- GitHub repository: source of truth and collaboration.
- Execution Host: `Zubair Army Runner` Replit app, configured through environment variables.
- CI compatibility: Forgejo/Gitea-style runner or another compatible worker can be attached later; the execution host does not depend on GitHub-hosted runners.

## Required runtime contract

The host must expose only an allowlisted job interface. It must support:

1. repository checkout/update from an explicit ref;
2. dependency installation using the repository's documented package manager;
3. unit/integration/E2E smoke tests;
4. bounded retries and structured logs;
5. health/readiness checks;
6. persistent job status;
7. no arbitrary shell command execution from user input;
8. secrets only through environment/secret storage;
9. a kill switch and resource/time limits.

## First jobs

- `fabric-test`
- `product-registry-test`
- `revenue-e2e`
- `production-readiness`
- `full-smoke`

## Acceptance evidence

The execution host is considered operational only after all of the following are observed from the running host:

- health check passes;
- a repository checkout job succeeds;
- `fabric-test` succeeds;
- `product-registry-test` succeeds and confirms 18 products;
- `revenue-e2e` succeeds;
- `production-readiness` reports its remaining external evidence explicitly;
- failure/retry behavior is exercised without duplicate revenue events.

The existence of this document is not evidence that those runtime checks have already passed.
