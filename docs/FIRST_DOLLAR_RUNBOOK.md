# First-Dollar Validation Runbook

The only MVP success criterion is one real, verified customer payment. The amount is intentionally irrelevant; $0.25 is enough to prove the commercial loop.

## Customer flow
1. Open `/checkout/json-cleaner`.
2. Enter a customer identifier.
3. Create a payment order.
4. Pay the displayed USD-equivalent amount to Binance Pay merchant UID `717654739`.
5. Keep the Binance Pay transaction/reference ID.

The $0.25 beta payment grants 25 prepaid API requests.

## Verification flow
Until Binance Pay merchant API credentials/webhooks are configured, payment verification is intentionally manual.

An authorized operator calls `POST /api/v1/payment/confirm` with:
- `x-payment-confirm-secret`
- `intentId`
- `externalRef`

The endpoint atomically:
- marks the payment intent confirmed;
- creates a confirmed RevenueEvent for the actual $0.25 payment;
- issues one customer API key (returned once);
- grants 25 prepaid requests.

## API proof
Call `POST /api/v1/normalize` with `Authorization: Bearer <customer-api-key>` and a JSON body containing `text`.

Each successful request consumes one prepaid credit and records a usage event with zero additional revenue. This prevents double-counting the original payment.

The proof chain is:

Customer → Binance Pay payment → independent verification → Revenue Ledger → API access → prepaid usage.

## Production gate
Do not call a payment confirmed until the operator has independently verified the transaction in the merchant account. Never infer payment from a client-side screenshot or request body alone.
