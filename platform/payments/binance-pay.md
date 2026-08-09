# Binance Pay Activation Gate

Binance Pay is an optional checkout adapter. It remains disabled until merchant onboarding and API credentials are configured outside Git.

Required before production:
- Merchant/account eligibility confirmed
- API key and secret stored in GitHub/Vercel secrets, never committed
- Request signature verification implemented
- Webhook authenticity verification implemented
- Idempotency keys enforced
- Payment status reconciliation implemented
- Refund handling mapped into the Revenue Ledger
- Sandbox/test transaction verified
- Production transaction verified manually before enabling autonomous reconciliation

No repository file contains payment credentials.
