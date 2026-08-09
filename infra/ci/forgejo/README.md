# Forgejo execution fallback

Forgejo Actions is the preferred independent CI path for ZOPAIR because it is self-hostable and uses separately managed runners.

## Deployment contract

- Forgejo instance: self-hosted.
- Runner: Forgejo Runner on a dedicated container/VM.
- Labels: `zopair-linux`, `zopair-container`.
- Runner has no production secrets by default.
- Production deployment is a separate privileged job requiring an explicit deployment credential.
- Artifacts are retained locally or in an S3-compatible store.

## Migration rule

Keep workflows provider-neutral. Do not depend on GitHub-only marketplace actions in the critical path. Prefer repository scripts and OCI containers so the same workload can run under GitHub Actions, Forgejo Actions, Woodpecker or locally.
