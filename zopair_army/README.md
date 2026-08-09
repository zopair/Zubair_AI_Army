# ZOPAIR ARMY — Swarm Core

Framework-neutral execution core for a capability-routed agent swarm.

## Current architecture

```text
Intent / Task
     ↓
Skill Discovery → Skill Registry
     ↓
Capability Router → Permission Gate
     ↓
Best Agent (fit + learned performance + cost + latency + risk)
     ↓
Execution Adapter
     ↓
Independent Judge
     ↓
Performance Memory + Audit Trail
     ↓
Future routing improves from observed results
```

## Initial units

- Scout — discovery/research
- Builder — implementation/testing
- Operator — API/browser/automation
- Guardian — security/policy/audit
- Judge — independent evaluation
- Commander — orchestration and final decision

## Why framework-neutral

The core deliberately has no mandatory dependency on LangGraph, AutoGen, CrewAI, MCP, a model vendor, or a cloud provider. External frameworks should plug into `ExecutionAdapter` only after being benchmarked against the same task suite. This prevents framework lock-in and lets small/open-source alternatives compete with famous projects on evidence rather than stars.

Canonical adapter candidates currently tracked for future experiments:

- LangGraph: https://github.com/langchain-ai/langgraph
- CrewAI: https://github.com/crewAIInc/crewAI
- Microsoft AutoGen ecosystem: https://github.com/microsoft/autogen

These links are research targets, not production dependencies.

## Skills

`skill_registry.mjs` defines capability-oriented skills with explicit permissions and risk classes. Skills answer **how** a task should be performed; tools/adapters answer **with what** it is executed.

## Performance memory

`performance_memory.mjs` records success, cost, latency and risk per agent/task type. The router can use those observations in later selections. This is intentionally lightweight and deterministic; persistent database-backed memory is a later layer.

## Deterministic validation

```bash
node zopair_army/core.test.mjs
node zopair_army/benchmark.mjs
```

The tests and benchmark use a local deterministic adapter. They make no network calls, use no credentials, and spend no money.

## Next experiments

1. Implement one real execution adapter in a sandbox.
2. Benchmark LangGraph, AutoGen and CrewAI adapters against identical tasks instead of assuming one is best.
3. Add persistent performance memory through the existing data layer.
4. Add MCP/Skill discovery with permission and trust inspection before activation.
5. Add durable checkpointing only after the framework benchmark identifies a clear benefit.
