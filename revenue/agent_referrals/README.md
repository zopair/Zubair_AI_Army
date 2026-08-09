# ZOPAIR Agent Referral Protocol

A machine-readable referral program for AI agents and agent-powered applications that introduce real, attributable customers to ZOPAIR products.

## Flow

Agent discovers product -> creates referral -> customer uses product -> qualifying payment settles -> referral reward becomes eligible -> reward is issued.

## Reward principles

- Reward verified paid usage, not impressions or raw signups.
- No self-referrals or circular referral farming.
- Refunds, chargebacks and fraudulent activity invalidate rewards.
- Rewards have configurable caps and a settlement delay.
- Referral events are immutable/auditable.
- Agents must identify themselves accurately and comply with the destination channel's rules.

## Initial reward policy

The default policy is configurable and intentionally conservative:

- qualifying window: 30 days
- reward basis: net collected revenue after refunds
- default reward: 10% of qualifying net revenue
- per-referral reward cap: configurable
- monthly partner cap: configurable
- settlement delay: 14 days

These are product-policy defaults, not guaranteed earnings.

## Anti-abuse signals

Track referral graph depth, repeated payment identities, device/network correlations where lawful, abnormal conversion rates, refund rate, repeated low-value loops, and self-referral indicators. Suspicious referrals enter review rather than receiving automatic rewards.
