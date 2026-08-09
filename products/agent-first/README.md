# ZOPAIR Agent-First Products

These products target AI agents and developer systems directly. They should expose machine-readable contracts, predictable errors, low-friction discovery, usage metering, and safe capability boundaries.

## Initial portfolio

1. **Agent Gateway** — one authenticated endpoint for discovering and routing approved ZOPAIR tools.
2. **Tool Health Checker** — verifies latency, schema validity, auth behavior and deterministic error contracts.
3. **Agent API Inspector** — scores an API for agent discoverability, documentation, schema quality and action safety.
4. **JSON Repair API** — repairs common malformed JSON with explicit confidence and validation output.
5. **Structured Extractor** — extracts fields from text into a caller-provided JSON schema.
6. **Document Chunking API** — deterministic chunking with token/character budgets and metadata.
7. **PII Redaction API** — detects and redacts configurable PII patterns before downstream processing.
8. **Webhook Reliability API** — replay, verify and inspect webhook deliveries with idempotency support.
9. **Agent Memory Utilities** — compact, deduplicate and rank context records for downstream agents.
10. **Agent Evaluation Harness** — run repeatable tool-use tests and report success, latency and failure classes.

## Why these first

Public evidence shows software development dominates the agent-tool ecosystem, while tool selection and reliability remain practical pain points. The portfolio therefore favors infrastructure and utilities that agents can call repeatedly rather than novelty chatbots.

## Product rule

Every tool must publish a machine-readable contract, examples, limits, authentication requirements, error taxonomy and measurable quality tests before promotion.
