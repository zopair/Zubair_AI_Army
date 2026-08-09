# Zopair Agent Lab v1

Purpose: empirical selection of open-source components for the Zopair Autonomous Revenue Engine (ZARE).

## Rules
- No real-money trading, token purchases, mining contracts, or paid campaigns in v1.
- No wash trading, fake volume, fake holders, or artificial market activity.
- First stage measures reproducible engineering signals: installability, startup time, task completion, failure recovery, resource use, and extensibility.
- Revenue experiments are sandbox/paper experiments until a separate approval gate is passed.

## Initial candidates
1. OpenHands — software/task execution agent
2. Agent Zero — general autonomous agent
3. CrewAI — multi-agent orchestration
4. AutoGen — multi-agent orchestration
5. LangChain/LangGraph — tool and workflow substrate
6. n8n — workflow automation
7. CCXT — exchange API abstraction for market-data experiments
8. Hummingbot — trading-engine research/simulation

## Scorecard
- Install/start reliability: 15
- Task completion: 25
- Recovery/self-correction: 15
- Cost/resource efficiency: 15
- Tool/API integration: 10
- Observability: 10
- Scalability: 10

A component only graduates after repeatable tests and license/security review.
