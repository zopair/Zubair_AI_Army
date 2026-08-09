# ZOPAIR ARMY benchmark runbook

## Goal
Compare the swarm core against external orchestration frameworks without changing task semantics or declaring a winner from GitHub popularity.

## Required controls

- identical task fixtures
- identical model/provider where applicable
- identical timeout budget
- isolated credentials
- network disabled unless the task explicitly requires it
- record framework version, model version, latency, failures and estimated cost
- never place secrets in the repository

## Adapter order

1. ZOPAIR core (deterministic baseline)
2. LangGraph adapter
3. AutoGen adapter
4. CrewAI adapter
5. additional candidates only after the first matrix is reproducible

## Current fallback

The repository contains a framework-neutral contract adapter. This lets the benchmark and scoring pipeline run without installing external frameworks. It is a **control**, not evidence that ZOPAIR is faster or better than those frameworks.

## When GitHub Actions runners are unavailable

Use a local Node.js environment to run the deterministic matrix. For external framework comparisons, install each framework in a separate environment and implement only the adapter boundary. Keep task fixtures identical.

Do not weaken security controls or remove high-risk approval gates merely to make CI green.

## CI constraint observed during development

GitHub Actions currently fails before job execution because the account/repository cannot start a runner due to a billing/spending restriction. This is infrastructure, not a test failure. If the restriction remains, acceptable alternatives are:

- run the deterministic suite locally;
- use an organization-owned runner with appropriate authorization;
- use a self-hosted runner controlled by the project owner;
- re-enable Actions billing/spending limits;
- keep the PR unmerged until an independent execution result is available.

No alternative should bypass repository security policies or expose credentials.
