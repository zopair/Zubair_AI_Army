# Zopair Agent Lab — Stage 2

## Objective
Compare candidate agent frameworks under one controlled task definition before any live revenue experiment.

## Candidates
- OpenHands — software-agent execution
- Agent Zero — general autonomous agent
- CrewAI — multi-agent orchestration

## Controlled task
1. Discover a legal digital-service opportunity.
2. Estimate inputs, operating cost, and expected revenue.
3. Produce a reproducible execution plan.
4. Identify failure modes and explicit stop conditions.

## Scoring dimensions
| Dimension | Weight |
|---|---:|
| Task completion | 30 |
| Cost efficiency | 20 |
| Reliability | 20 |
| Automation depth | 15 |
| Scalability | 10 |
| Observability | 5 |

No score is assigned until an actual run is captured. No simulated revenue is treated as revenue.

## Safety gate
Stage 2 is offline/deterministic. It performs no trading, mining, purchases, wallet signing, or paid API calls.

## Promotion gate to Stage 3
A candidate must have reproducible task completion, measurable runtime/cost telemetry, and a sandbox-compatible execution path. Only then may it enter a micro-budget live experiment.
