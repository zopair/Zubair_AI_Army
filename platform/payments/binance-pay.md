# Binance Pay — Receive Only

ZOPAIR uses the configured Binance Pay identifier only as a destination for customer payments.

- Merchant UID: `717654739`
- Mode: `receive_only`
- Customer payments: allowed
- Agent outbound transfers: disabled
- Autonomous treasury spending: disabled
- Withdrawals: disabled

The UID is not a secret and is not a private-key substitute. No API secret, signing credential, or private key is stored in GitHub.

For a future automated checkout integration, the payment flow must verify payment status server-side and record the confirmed payment in the Revenue Ledger before granting paid usage. No autonomous money movement is enabled by this configuration.
