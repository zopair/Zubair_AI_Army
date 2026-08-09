# Payment boundary

A receiving identifier is not payment verification.

Required adapter contract:

1. Create or reference an order ID.
2. Generate/obtain a payment request or invoice identifier.
3. Wait for an authoritative payment event from the processor/wallet integration.
4. Verify amount, asset, destination and order correlation.
5. Record an idempotent `payment_verified` event.
6. Only then grant entitlement and trigger delivery.

No agent may mark an order as paid based on a user claim, screenshot, static receiving UID, or an unverified transaction hash.

The adapter is provider-neutral so BTCPay Server, another crypto processor, or a future fiat processor can be plugged in without changing the order/fulfillment layer.
