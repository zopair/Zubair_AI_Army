# First Revenue Validation Protocol

## Gate 1 — Product correctness

- valid authentication succeeds
- missing/invalid authentication is rejected
- malformed input is rejected
- oversized input is rejected
- deterministic normalization is reproducible

## Gate 2 — Metering

- every successful request receives a unique request ID
- usage units are deterministic
- gross revenue is calculated from configured price
- API keys are never stored in plaintext

## Gate 3 — Economics

Measure real variable cost per request and contribution margin. Do not assume `variableCost = 0` represents production economics; it is only the initial ledger placeholder.

## Gate 4 — Payment

Add a payment processor only after the first three gates pass. Payment webhooks must be idempotent and independently auditable.

## Gate 5 — Scale

Scale only when quality remains high, security gates remain healthy, and measured contribution is positive over a meaningful sample.
