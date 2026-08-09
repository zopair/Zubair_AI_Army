# Remaining 40% — operational closure research

## Objective
Close the remaining commercial/operational gaps without adding unnecessary paid infrastructure.

## Findings

### 1. Self-hosted CI
Primary: Forgejo Actions + Forgejo Runner. Forgejo documents that Actions executes workflows through separately installed runners; this removes dependence on GitHub-hosted runners. Secondary: Woodpecker CI. Emergency compatibility: `act` locally.

Decision: keep GitHub as source/distribution; make self-hosted CI the execution authority.

### 2. Payment verification
Primary crypto-native option: BTCPay Server (`btcpayserver/btcpayserver`) for self-hosted Bitcoin payment processing and webhooks. Do not treat a static payment identifier as proof of payment. The payment boundary must verify an invoice/payment event before fulfillment.

Decision: payment adapter interface first; BTCPay adapter optional, with manual verification fallback. The existing Binance receiving UID remains a receiving destination only and is never used as an authorization signal.

### 3. Analytics
Primary: Umami (`umami-software/umami`) for privacy-focused self-hosted web analytics, custom events, funnels, UTM tracking and API. Keep the internal event ledger as the source of truth for orders/payments; analytics is observational.

### 4. Product/order/fulfillment
Do not import a full ecommerce platform until product count or transaction volume requires it. The current product registry + order ledger + entitlement/delivery interfaces are cheaper and easier to operate. Candidate future platforms: Spree for a full headless commerce stack; Lago for billing/usage billing. Neither is required for the first revenue proof.

### 5. Sales/market intelligence
Use a deterministic pipeline around public evidence: discover -> normalize -> deduplicate -> score -> qualify -> create content -> authorized outreach -> bounded follow-up -> conversion measurement. Agents must not fabricate identity, evade rate limits, or bypass platform controls.

### 6. Reliability
Every external adapter must implement timeout, retry with backoff, idempotency key, circuit breaker state, structured result and health check. Persist the last successful checkpoint so an interrupted agent resumes rather than duplicates work.

### 7. Sustainability
Default policy: local/open source first; self-hosted second; free quota third; paid last. Paid execution requires an explicit budget policy and must never be enabled by an agent autonomously.

## Closure definition
The remaining work is closed only when an end-to-end test proves: product published -> visitor event -> qualified lead/order -> verified payment -> entitlement -> delivery -> ledger entry -> analytics event -> recovery after simulated failure.

## Sources
- Forgejo Actions documentation: https://forgejo.org/docs/latest/user/actions/overview/
- Forgejo Runner administration: https://forgejo.org/docs/v15.0/admin/actions/
- BTCPay Server: https://github.com/btcpayserver/btcpayserver
- Umami: https://github.com/umami-software/umami
