# ZOPAIR Cost Policy

## Objective
Reach the first validated revenue event before adding recurring infrastructure spend.

## Execution order
1. Local/open-source execution.
2. Self-hosted open-source runners.
3. Free provider quotas only when they do not create lock-in.
4. Paid services only after a documented revenue or reliability justification.

## Rules
- No paid development runtime is required for the core test suite.
- No Replit runtime dependency.
- No paid API is required for deterministic product tests.
- Credentials and payment identifiers stay outside Git.
- Every paid dependency must have an owner, purpose, monthly ceiling, and removal path.

## Revenue gate
A paid infrastructure dependency is not justified merely because it makes development easier. Prefer free/open-source alternatives until the product has demonstrated demand or revenue.
