# Payment Adapter

Binance Pay is the preferred optional crypto checkout adapter for the first revenue MVP.

The repository contains configuration and safety gates only; it is disabled by default. Production activation requires a Binance merchant account, API credentials stored as secrets, verified webhooks, idempotent order handling, and reconciliation.

Binance publishes official developer documentation and a public `binance-pay-signature-examples` repository. Use only documented endpoints and supported SDK/examples when implementing the live adapter.

Do not place API keys, secrets, wallet seed phrases, or private keys in the repository.
