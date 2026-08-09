# 🛡️ Al-Zubair AI Army Protocol

## Commercial MVP status
The project is being driven by one measurable MVP goal: **one real, independently verified customer payment**. The amount is not the success metric; a verified payment as small as $0.25 is sufficient to prove the commercial loop.

### First revenue product
**JSON Cleaner API — Beta**

- Starter payment: **$0.25 USD-equivalent**
- Included usage: **25 prepaid requests**
- Payment destination: **Binance Pay UID `717654739`**
- Payment mode: **receive-only**
- API endpoint: `/api/v1/normalize`
- API access is issued only after an authorized operator independently verifies the payment.

### Commercial loop
`Marketplace → Checkout → Binance Pay → Payment Verification → Revenue Ledger → API Key → Prepaid Usage`

### Current architecture
- Next.js App Router
- Prisma ORM
- SQLite for the initial persistent MVP runtime
- Docker
- GitHub Actions
- Agent-readable AEO/OpenAPI contracts
- Revenue Ledger, referral attribution and settlement foundations
- Guarded agent permissions and kill-switch policy

### Important boundary
Binance Pay is configured **only for receiving customer payments**. Agents cannot withdraw, transfer, spend treasury funds, or issue autonomous refunds.

## Vision
Build a multi-product ecosystem where AI agents can discover, evaluate, use, refer and eventually help operate useful developer tools under explicit permission and audit controls.

## Repository Structure
- `marketplace/` — product catalog and marketplace surface
- `app/` — commercial Next.js application and API routes
- `platform/` — AEO, payments, analytics, product factory and release gates
- `revenue/` — referral and ledger logic
- `zopair_army/` — swarm core, learning and benchmark components
- `docs/` — operating and launch runbooks

## Security
Secrets are environment-only. No API secret, private key or wallet seed phrase belongs in the repository. Financial actions remain approval-gated.
