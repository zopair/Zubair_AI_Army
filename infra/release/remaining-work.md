# Final execution closure

## Required evidence before declaring 100%

- [ ] All 18 products have verified runnable/public URLs.
- [ ] Every product has a clear offer, price, fulfillment method, and owner agent.
- [ ] At least one product has a production deployment.
- [ ] Marketing campaign produces measurable public traffic.
- [ ] Lead capture is operational and deduplicated.
- [ ] Sales qualification and bounded follow-up are operational.
- [ ] Payment provider produces an authoritative event that can be verified.
- [ ] Successful payment creates an entitlement/order state.
- [ ] Delivery is automatic and idempotent.
- [ ] Referral attribution survives retries and duplicate events.
- [ ] Revenue ledger reconciles orders, payments, refunds, and delivery.
- [ ] Self-hosted execution worker has completed a real CI run.
- [ ] Backup/restore has been exercised.
- [ ] Failure of a provider triggers retry/fallback without duplicate delivery.
- [ ] Operational metrics are visible.
- [ ] First real customer transaction is recorded.

## Execution principle

Do not mark a checkbox because configuration exists. Each checkbox requires observable evidence from a running system.

## Cost rule

No new paid infrastructure is required for the core loop unless an open-source/self-hosted alternative has been evaluated and rejected for a documented technical reason.
