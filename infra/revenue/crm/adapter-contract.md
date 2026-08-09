# CRM adapter contract

The revenue swarm must not depend on one CRM.

Minimum operations:

- `upsertLead`
- `createOpportunity`
- `recordTouch`
- `scheduleFollowup`
- `recordOutcome`
- `queryPipeline`

Candidate self-hosted provider: Twenty CRM. It supports self-hosting and exposes API access. It is an optional operational backend, not a hard dependency.

Fallback: the internal event ledger can operate as a minimal CRM until a real self-hosted instance is provisioned.

Agent rule: outreach agents may only act on leads that passed the qualification policy and have a configured, authorized channel.
