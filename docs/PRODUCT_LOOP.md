# ZOPAIR ARMY product loop

The project now prioritizes a working product over indefinite architecture research.

## First usable loop

`CLI task -> Commander/Router -> Skill/Tool selection -> Agent execution -> Independent Judge -> Audit -> Learning memory`

## Operating rule

Build the smallest useful path, run real tasks, observe failures and costs, then improve the system from evidence.

Research remains an input, not the deliverable.

## v0.1 acceptance criteria

- One command can submit a task locally.
- A router selects an eligible agent/skill.
- Execution is isolated behind an adapter boundary.
- An independent judge produces a verdict.
- An audit trace is emitted for each major lifecycle event.
- The result has a stable run identifier.
- The same workflow can be regression-tested without external paid services.

## Post-v0.1 loop

1. Collect real task traces.
2. Classify failures: routing, skill, tool, model, execution, judge, infrastructure.
3. Turn recurring failures into regression tests.
4. Turn validated patterns into candidate lessons/skills.
5. Benchmark candidates.
6. Promote only when quality improves without unacceptable cost/risk regressions.

Never use production traffic as permission to bypass security gates.
