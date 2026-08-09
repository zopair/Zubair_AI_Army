# ZOPAIR ARMY — Swarm Core

First vertical slice of the ZOPAIR ARMY execution layer.

## Design goals

- Coordinator/Commander separates planning from execution.
- Agents are capability-based and scored by fit, reliability, cost, latency and risk.
- A Judge is independent from the worker that produced the result.
- Every execution produces an audit record.
- No external framework is required for the core; adapters can later target LangGraph, AutoGen, CrewAI, MCP, APIs or local tools.
- Least-privilege permissions are part of agent selection.

## Initial units

- Scout — discovery/research
- Builder — implementation
- Operator — external/API/browser operations
- Guardian — security and permission review
- Judge — independent evaluation
- Commander — task decomposition, routing and final decision

## Architecture

```text
Task -> Commander -> Agent Router -> Worker -> Judge -> Commander -> Result
                         |                         |
                    capability score         audit record
                         |
                   policy / permissions
```

The core intentionally avoids hard-coding a model vendor or agent framework. This lets ZOPAIR ARMY benchmark multiple orchestration engines instead of becoming locked into one.

## Run the smoke test

```bash
node zopair_army/core.mjs
```

The smoke test is deterministic and uses mock workers, so it does not call external services or spend money.
