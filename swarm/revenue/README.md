# Revenue Swarm

The revenue swarm is responsible for product discovery, campaign preparation, lead qualification, compliant outreach, follow-up, referral attribution, and reporting.

## Agents

- `market-researcher`: discovers relevant public prospects and validates fit.
- `content-agent`: creates product-specific public marketing assets.
- `sales-qualifier`: scores inbound leads and routes qualified opportunities.
- `outreach-agent`: prepares and sends only policy-compliant, rate-limited outreach through an explicitly configured channel.
- `followup-agent`: schedules bounded follow-ups and stops after the configured limit.
- `referral-agent`: attributes referral links/codes and rewards eligible referrals.
- `revenue-analyst`: measures visits, leads, conversions, revenue, and acquisition cost.

## Operating rule

Agents do not fabricate identities, bypass platform controls, create deceptive accounts, or evade anti-spam/rate limits. Public discovery is separated from outreach. Sending is disabled until a channel adapter and authorization policy are configured.

## Revenue loop

Discover -> qualify -> create useful content -> invite -> capture lead -> follow up -> payment -> deliver -> measure -> improve.
