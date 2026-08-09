# Open-source Alternative Decision Matrix

| Problem | Candidate | Role | Decision |
|---|---|---|---|
| Reproducible execution | Dagger | container execution | Primary |
| GH Actions compatibility | act | local workflow runner | Primary fallback |
| Self-hosted CI | Woodpecker | CI | Primary remote fallback |
| Self-hosted forge + CI | Forgejo + act_runner | source + CI | Secondary option |
| Visual automation | Activepieces | workflow automation | Preferred |
| Mature workflow reference | n8n | automation | Reference / evaluate licensing before adoption |
| Agent coding sandbox | OpenHands | reference / specialized worker | Optional |
| Stateful agent infrastructure | Agyn research | architecture reference | Research input, not dependency |
| Product analytics | PostHog self-hosted | analytics | Add after event ledger proves insufficient |

## Selection principles

- Prefer permissive open-source licenses for core dependencies.
- Prefer components that can run on commodity hardware.
- Avoid provider lock-in.
- Keep the ZOPAIR task contract stable while swapping providers.
- Every dependency must have a removal path.
- Do not add infrastructure unless it closes a measured operational gap.
