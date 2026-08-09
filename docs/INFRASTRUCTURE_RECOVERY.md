# Infrastructure Recovery Plan

## Current blocker
GitHub Actions may fail before job execution when the account has a billing/spending restriction. This is an account-level control, not a repository code defect.

## Recovery ladder
1. Restore/raise the GitHub Actions budget or billing entitlement.
2. Use a dedicated self-hosted Linux runner for CI when Actions-hosted capacity is blocked.
3. Keep a local/container CI path for deterministic tests while hosted execution is unavailable.
4. Keep production deployment independent of GitHub Actions where practical.

## Recommended runner architecture
- Private repository access only.
- Dedicated ephemeral runner or disposable VM/container.
- Label: `zopair-ci`.
- No production secrets on the runner.
- Read-only production credentials unless a deployment job explicitly requires them.
- Separate test and deployment runners.
- Use Docker for reproducible dependencies.

A self-hosted runner is free from GitHub Actions minute billing, but its machine/network/security maintenance remains our responsibility.

## Open-source candidates researched
- `myoung34/docker-github-actions-runner`: Docker-based self-hosted runner implementation.
- `tcardonne/docker-github-runner`: lightweight Docker runner alternative.
- GitHub Actions Runner Controller (ARC): Kubernetes autoscaling option for later scale, not required for the first revenue test.

## Security decision
Do not switch the entire repository to self-hosted runners blindly. GitHub recommends self-hosted runners primarily for private repositories because untrusted forked workflows can execute code on the runner.

## First-revenue priority
Do not let CI infrastructure block the revenue experiment. The minimum path is:

code → reproducible local CI → deploy → receive payment → verify payment → RevenueEvent.

Hosted CI can be restored in parallel.
