# Pink & Red Market — Zero-Budget MVP & Supplier Adapter Readiness

## Approved operating decisions

- Launch sequence: Egypt first; Saudi Arabia and UAE second.
- Incremental budget: EGP/USD 0 for now. Prefer existing/free tiers; do not activate paid subscriptions, paid ads, paid apps, or purchase samples without explicit owner approval.
- Product selection: engineering team proposes low-risk products based on verified landed cost, delivery coverage, return exposure, and contribution margin. No product is approved for sale until supplier cost and fulfillment are verified.
- Payment: Cash on Delivery where a supplier/courier and the storefront checkout can support it; add online payment only after a supported provider is verified for the merchant's Egypt-based business and target market.

## Current Shopify store facts

- Store domain: snvp4e-1j.myshopify.com
- Store currency: EGP
- Store country: Egypt
- Current plan: trial
- Required merchant notice: `Plan: trial — you'll need to upgrade before you can start selling and unlock full features`

The storefront is not production-ready for selling while it remains on trial. Do not claim supplier connectivity, COD checkout, payment gateway availability, or fulfillment automation until each is tested in the actual store.

## Supplier integration findings and gates

### Safqa / Ordratk

The public Safqa page advertises an integration between Safqa and Ordratk, including product import, order handoff, COD collection and wallet payouts. This is evidence of an Ordratk integration, not proof of a Shopify app or a public Shopify-compatible API.

**Decision:** candidate for Egypt sourcing only. Before implementation, obtain written confirmation of:
1. A documented API or supported Shopify integration.
2. Merchant eligibility for an Egypt-based seller using Shopify.
3. Product/variant identifiers, live stock and price endpoints.
4. Order create/cancel/status and tracking endpoints.
5. COD remittance, return fees, rejected-delivery fees and payout schedule.
6. Data processing and customer-data handling terms.

Until confirmed, do not send Shopify orders automatically to Safqa. A manual workflow may be evaluated separately, with no customer data transferred without approval.

Official public page: https://ordratk.com/safka

### DSers / AliExpress

DSers officially supports Shopify and lists a free Basic plan. Its official hosted MCP service is subject to DSers account plan, permissions and tool availability; the current pricing page marks MCP unavailable on Basic.

**Decision:** use the free DSers Basic account only for permitted manual supplier/product research and mapping if useful. Do not design MVP around DSers MCP or paid automation. Check actual shipping cost and delivery estimate for each SKU, variant and destination.

Official sources:
- https://www.dsers.com/integration
- https://dsers.com/pricing
- https://www.dsers.com/mcp-server

### GulfCOD

GulfCOD advertises COD dropshipping across GCC markets and publishes delivery/return charges and a 4.5% platform fee on delivered COD orders. Its payout policy states weekly settlement and a minimum AED 190 payout threshold. These are provider-published claims, not independently verified service guarantees.

**Decision:** defer activation until GulfCOD confirms in writing:
1. Eligibility of an Egypt-registered merchant.
2. Accepted payout destination, currencies, conversion and intermediary bank fees.
3. Seller KYC/business documentation.
4. Product catalog, stock ownership and supplier location.
5. Actual order submission method/API/Shopify app.
6. Return, failed-delivery, dispute and compensation rules by country.

Do not promise automatic Shopify integration or cross-border payouts.

Official sources:
- https://gulfcod.com/pages/gcc-cod-dropshipping-platform
- https://gulfcod.com/pages/payout-policy
- https://gulfcod.com/pages/terms-and-conditions

## MVP product selection policy

Start with a shortlist of 6 Egypt-market SKUs, not a live catalog. Candidate categories:
- Non-electrical home organization.
- Hair accessories without cosmetics/chemicals.
- Stationery and lightweight gift items.
- Non-fragile party supplies.

Do not choose exact SKUs until supplier evidence is collected. Exclude cosmetics, supplements, food, medical claims, batteries/electronics requiring approvals, glass/fragile goods, bulky goods, and high-size-variation apparel from the first pilot.

A candidate SKU must pass all gates:
- Stable supplier SKU/variant identifier.
- Confirmed stock and current cost.
- Written shipping cost and delivery range to the target Egyptian governorates.
- Clear COD availability and remittance terms.
- Written return/refusal fee and defect policy.
- Product compliance and safe listing claims.
- Positive contribution margin after product cost, shipping, COD/collection fees, payment fees, expected returns and marketing.
- Sample/quality check before scaling when feasible; no sample purchase without owner approval.

## Supplier adapter contract (design only; no live credentials)

Each adapter must implement:
- `capabilities()`: report supported operations and countries.
- `searchProducts(query, destination)`
- `getProduct(supplierProductId)`
- `getVariants(supplierProductId)`
- `quoteShipping(variantId, destination, quantity)`
- `getInventory(variantId)`
- `createOrder(idempotencyKey, orderPayload)`
- `getOrderStatus(supplierOrderId)`
- `cancelOrder(supplierOrderId)`
- `getTracking(supplierOrderId)`

Normalized product mapping fields:
- `supplierCode`
- `supplierProductId`
- `supplierVariantId`
- `shopifyProductId`
- `shopifyVariantId`
- `supplierSku`
- `destinationCountry`
- `lastVerifiedAt`

Normalized order lifecycle:
`RECEIVED -> VALIDATED -> AWAITING_MANUAL_APPROVAL -> SUBMITTED -> ACCEPTED -> FULFILLING -> SHIPPED -> DELIVERED`
Exceptional states:
`BLOCKED`, `REJECTED`, `CANCEL_PENDING`, `CANCELLED`, `RETURNED`, `FAILED`.

Reliability and security requirements:
- Never submit an order twice; enforce idempotency per Shopify order and supplier.
- Keep manual approval before supplier submission during pilot.
- Persist audit events and supplier responses without logging secrets or unnecessary customer PII.
- Store credentials only in GitHub Actions secrets or a managed secret store, never in source control.
- Retry only safe, idempotent operations; inspect status after uncertain writes.
- Do not claim a supplier integration is operational until sandbox/live tests pass.

## Immediate next actions

1. Ask Safqa/Ordratk whether Shopify is supported independently of Ordratk and request API documentation.
2. Ask GulfCOD to confirm Egypt-based seller eligibility and payout rails.
3. Verify DSers Basic account capabilities and shipping quotes for a small set of candidate SKUs.
4. Build the first six-product shortlist only after landed-cost and return terms are evidenced.
5. Keep all products as drafts until the merchant approves supplier, price, shipping promise and checkout behavior.

## Acceptance criteria for Egypt pilot

- Every active SKU has a verified supplier product and variant mapping.
- Every displayed price has a recorded landed-cost calculation and positive contribution margin.
- COD availability, collection responsibility and payout timeline are explicit.
- Every order has an auditable supplier status and tracking reference where supported.
- No automated supplier order is sent before manual approval.
- No paid service is activated and no sample is purchased without explicit owner approval.
