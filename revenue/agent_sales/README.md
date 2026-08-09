# Agent-to-Agent Sales Protocol

Goal: make ZOPAIR products discoverable by other agents without unsolicited spam.

## Discovery channels

- Public MCP/agent registries
- GitHub repositories and releases
- Public documentation and OpenAPI manifests
- Agent/plugin marketplaces
- Inbound requests and opt-in partner channels

The official MCP Registry provides a current discovery surface for MCP servers, and GitHub's official MCP Server demonstrates how agents can inspect repositories, issues and workflows. citeturn0search0turn0search1

## Agent roles

### 1. Scout
Finds agents, registries, directories and public integration requests where a ZOPAIR capability is genuinely relevant.

### 2. Matchmaker
Matches the requested capability to a ZOPAIR product using explicit tags and machine-readable manifests.

### 3. Sales Agent
Produces a concise product offer containing capability, limits, price, docs, demo and security notes. It may respond to inbound or explicitly permitted channels.

### 4. Onboarding Agent
Helps an interested agent configure the tool, run a test call and verify output.

### 5. Account Agent
Tracks activation, usage, retention and support signals.

## Hard boundaries

- No bulk unsolicited messages.
- No impersonation of humans or other agents.
- No fabricated reviews, installs, customers, usage numbers or testimonials.
- No bypassing CAPTCHAs, rate limits, access controls or platform rules.
- Respect robots.txt, API terms, marketplace rules and applicable privacy/marketing laws.
- Financial actions require separate authorization and are outside this sales protocol.

## Agent-ready offer format

```json
{
  "product": "...",
  "capability": "...",
  "best_for": ["..."],
  "limits": {"...": "..."},
  "pricing": {"model": "...", "unit": "..."},
  "docs": "...",
  "demo": "...",
  "security": ["..."],
  "evidence": ["measured claim only"]
}
```
