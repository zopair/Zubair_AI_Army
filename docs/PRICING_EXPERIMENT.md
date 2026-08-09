# Pricing Experiment — Normalize API

## Hypothesis

Customers may pay for deterministic document cleanup when it saves manual cleanup time and is predictable.

## Initial unit

1,000 output characters.

## Test prices

- $0.005 / unit
- $0.01 / unit
- $0.02 / unit

These are experiment prices, not claims about market willingness to pay.

## Decision signals

Track:

- successful requests
- repeat usage
- conversion when payment is enabled
- refund/support rate
- measured variable cost
- contribution margin
- latency
- quality failures

Do not optimize for request volume alone. A high-volume lane with negative contribution is not promoted.

## Promotion rule

Promote a price/product combination only after a meaningful sample shows reliable quality, healthy security controls, and positive contribution margin.
