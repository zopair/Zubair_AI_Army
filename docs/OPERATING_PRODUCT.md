# ZOPAIR ARMY Product Operating Loop

The project is now operated as a product, not an endless research exercise.

## Ship criteria for v0.1

- A local user can submit a bounded task.
- The router selects an eligible agent/skill.
- Least-privilege checks run before execution.
- Execution produces a run ID and audit events.
- An independent judge evaluates the result.
- Product metrics record success, quality, latency and cost.
- Failures are reproducible and become regression cases.

## Weekly operating loop

1. Run the smoke suite.
2. Inspect failed/rejected runs.
3. Select the three highest-value failures.
4. Fix or route around them.
5. Add regression tests.
6. Measure before/after.
7. Release only if quality does not regress and security gates remain intact.

## Priority order

1. Correctness
2. Safety and permission boundaries
3. Reliability
4. Useful task coverage
5. Latency
6. Cost
7. Capability expansion

## Research rule

A new framework, model, skill or service enters the product only when it solves a measured problem or materially improves a benchmark. Research without a product hypothesis remains in the research backlog.
