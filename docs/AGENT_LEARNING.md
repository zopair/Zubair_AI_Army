# ZOPAIR ARMY Agent Learning System

The learning layer teaches agents through bounded curriculum tasks rather than uncontrolled self-modification.

## Learning loop

1. Select the next lesson from the agent's prerequisites and capabilities.
2. Execute the lesson in a controlled environment.
3. Send the result to an independent evaluator.
4. Record success, score, latency and feedback in learning memory.
5. Retry a bounded number of times when appropriate.
6. Advance only when the lesson reaches the required mastery threshold.
7. Use accumulated mastery as evidence for future routing.

## Curriculum

- Observe before acting
- Select the minimum sufficient tool
- Verify independently
- Recover from failure
- Optimize after correctness

## Guardrails

- Learning never grants new permissions automatically.
- Agents cannot grade themselves.
- Production credentials are not training data.
- Failed lessons do not become accepted knowledge merely because they were repeated.
- Promotion to a higher lesson requires evidence from an independent evaluator.
- Changes to system policies, security controls or production behavior require explicit human approval.
- Skill and tool discovery remain subject to the existing trust and least-privilege policies.

## Future stages

- spaced repetition based on mastery decay
- adversarial lessons and red-team exercises
- synthetic task generation from historical failures
- skill versioning and rollback
- cross-agent knowledge distillation using approved, sanitized lessons
- persistent storage backed by the project's existing data layer
- benchmark-driven promotion gates
