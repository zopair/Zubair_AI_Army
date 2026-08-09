# First-Dollar Validation Runbook

The only MVP success criterion is one real, verified customer payment. The amount is intentionally irrelevant; $0.25 is enough to prove the commercial loop.

## Customer flow
1. Open `/checkout/json-cleaner`.
2. Enter a customer identifier.
3. Create a payment order.
4. Pay the displayed USD-equivalent amount to Binance Pay merchant UID `717654739`.
5. Keep the Binance Pay transaction/reference ID.

## Verification flow
Until Binance Pay merchant API credentials/webhooks are configured, payment verification is intentionally manual.

An authorized operator calls `POST /api/v1/payment/confirm` with:
- `x-payment-confirm-secret`
- `intentId`
- `externalRef`

The endpoint atomically:
- marks the payment intent confirmed;
- creates a confirmed RevenueEvent;
- issues one customer API key (returned once).

## API proof
Call `POST /api/v1/normalize` with `Authorization: Bearer <customer-api-key>` and a JSON body containing `text`.

The request creates a metered RevenueEvent. This proves the chain:

Customer → Binance Pay payment → verification → Revenue Ledger → API access → metered usage.

## Production gate
Do not call a payment confirmed until the operator has independently verified the transaction in the merchant account. Never infer payment from a client-side screenshot or request body alone.
