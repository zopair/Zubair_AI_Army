# Payment boundary

Payment confirmation is an external fact, not an agent decision.

Rules:
1. A lead/order may be created without payment.
2. Delivery is forbidden while status is `payment_pending`.
3. Only a verified payment adapter may emit `payment_confirmed`.
4. Webhook/callback signatures must be verified before accepting provider events.
5. Every confirmed payment must have an immutable order/event reference.
6. Manual verification remains available as a fallback; it must be recorded as an explicit operator event.
7. No agent may move an order directly from `payment_pending` to `delivered`.
