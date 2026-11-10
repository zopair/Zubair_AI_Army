# Pink & Red Market — Technical Implementation Plan

## Decision record

- Business model: one Shopify storefront operated by the store owner.
- Fulfillment: dropshipping; no owned inventory or bulk purchasing before customer orders.
- Catalog: one storefront with multiple curated collections; suppliers are mapped per product/variant.
- Cost policy: start with existing Shopify capabilities, GitHub Actions and supplier-native integrations. Add paid services only when a measured need justifies them.
- Deployment policy: changes are developed on feature branches and reviewed before merging to the default branch.

## Target architecture

```text
Customer
  |
  v
Shopify storefront + checkout + customer/order records
  |
  | Shopify webhooks / Admin API
  v
Commerce integration layer
  |-- Catalog normalization and supplier mapping
  |-- Price and stock synchronization
  |-- Order routing and fulfillment state machine
  |-- Tracking synchronization
  |-- Audit log and retry queue
  |
  +--> DSers supplier workflow (first integration candidate)
  +--> CJdropshipping (optional second adapter after validation)
  |
  +--> GitHub Actions (scheduled sync, tests, reports)
  +--> Flowise (optional AI-assisted enrichment; later phase)
  +--> Huginn (optional event monitoring; later phase)
```

Shopify remains the system of record for the customer-facing catalog, checkout, customers and sales orders. Supplier platforms remain the source of truth for supplier cost, supplier inventory, shipping options and supplier fulfillment status.

## GitHub repository roles

### Project control plane

- Repository: https://github.com/zopair/Zubair_AI_Army
- This repository owns the architecture, implementation plan, integration contracts, CI workflows and operational runbooks for the store project.
- Do not place store credentials, customer data, API tokens or private supplier data in this public repository.

### Reusable projects and references

- DSers MCP documentation: https://github.com/dsers/dsers-mcp-server
  - Reference/integration candidate for supplier search, product mapping, import/publish, order placement and tracking workflows.
  - The repository documents a hosted DSers MCP service; it is not the production backend source code. Availability depends on a DSers account, OAuth authorization, role/scopes and plan.
- Shopify official app template: https://github.com/Shopify/shopify-app-template-react-router
  - Use as the starting point only if a custom Shopify app becomes necessary. Do not fork it into the storefront repository by default.
- Shopify Hydrogen: https://github.com/Shopify/hydrogen
  - Optional future headless storefront path. Not needed for the first release; use the standard Shopify storefront/theme initially.
- CJ automation example: https://github.com/Sunzzx/shopify-dropshipping-automation
  - Research reference only. Do not copy code until its actual license and provenance are reviewed; the checked license file contains restrictions inconsistent with its README's MIT claim.
- Flowise: https://github.com/zopair/Flowise
  - Optional AI workflow service for product copy, categorization and research after the core order pipeline is stable.
- Huginn: https://github.com/zopair/huginn
  - Optional event monitoring and notifications; defer self-hosting until there is a concrete operational need.

## Integration contracts

### Canonical product record

Each imported product/variant must retain:
- Shopify product and variant IDs (after publishing)
- supplier platform and supplier product/variant IDs
- supplier SKU and source URL
- supplier cost and currency
- shipping method, shipping cost and destination coverage
- last verified stock and price timestamps
- selling price, margin floor and pricing-rule version
- product status: draft, approved, active, paused or rejected

Never rely on product title alone to identify or map a supplier variant.

### Supplier adapter interface

Each supplier adapter should implement:
- searchProducts(criteria)
- getProduct(productId)
- getShippingQuote(productId, variantId, destination)
- getInventory(productId, variantId)
- importOrPublish(product, targetStore)
- mapVariant(shopifyVariantId, supplierVariantId)
- submitOrder(order, mappedItems)
- getOrderStatus(supplierOrderId)
- getTracking(supplierOrderId)

Adapters must return normalized data and preserve the supplier's original identifiers.

### Order lifecycle

```text
Shopify order created
  -> validate payment and shipping address
  -> resolve supplier mapping for every line item
  -> verify stock, price and destination shipping
  -> calculate supplier cost and margin
  -> place supplier order only after policy checks
  -> receive supplier confirmation
  -> sync tracking to Shopify
  -> monitor delivery / exceptions / returns
```

Orders with unmapped variants, unavailable stock, changed supplier prices, unsupported destinations or insufficient margin must be held for manual review. Never automatically place an uncertain or duplicate supplier order.

## Pricing and margin controls

- Calculate landed cost as supplier item cost + supplier shipping + applicable known fees.
- Apply a configurable minimum gross-margin threshold per category.
- Recalculate before supplier order placement.
- Keep the selling price unchanged if supplier data is stale or unavailable; flag the item for review.
- Taxes, payment fees, duties, returns and advertising costs must be modelled separately rather than hidden inside a guessed markup.

## Security and reliability

- Store all API credentials in GitHub Actions secrets or a managed secret store; never commit .env files or tokens.
- Use least-privilege Shopify scopes and supplier OAuth scopes.
- Verify Shopify webhook signatures and make webhook handlers idempotent.
- Persist external IDs and order state before retrying writes.
- Use bounded retries with exponential backoff; uncertain supplier-order writes require a read-before-retry check.
- Log IDs and status transitions, not customer payment data or secrets.
- Require manual approval for supplier order placement until end-to-end tests and duplicate-order protections pass.

## Delivery phases

### Phase 0 — Readiness and constraints
- Confirm the target sales countries, currencies, shipping promises and returns policy.
- Confirm the Shopify store plan and sales-channel readiness.
- Create supplier accounts and validate destination-specific shipping quotes.
- Select a small pilot assortment across 2–3 categories.

### Phase 1 — Store foundation
- Configure brand, navigation, collections, policies and basic theme.
- Define product approval checklist and category taxonomy.
- Connect one supplier platform first; validate a single product end-to-end.

### Phase 2 — Catalog synchronization
- Implement supplier mapping and normalized product records.
- Import products as drafts.
- Add price/stock sync with stale-data safeguards.
- Add product-quality checks for images, descriptions, variants and shipping.

### Phase 3 — Order and fulfillment automation
- Receive Shopify order webhooks.
- Validate payment, destination, mapping, inventory and margin.
- Start with human-approved supplier order placement.
- Sync tracking and exception statuses back to Shopify.

### Phase 4 — Controlled scale
- Add the second supplier adapter only after the first is stable.
- Add category-level pricing and monitoring.
- Introduce Flowise/Huginn only where they reduce measured manual work.
- Expand the assortment gradually based on actual conversion, returns and fulfillment performance.

## Acceptance criteria for the pilot

- Every active variant has a verified supplier mapping.
- Destination shipping method, cost and estimated delivery window are known.
- Stock and supplier price have a recorded last-checked timestamp.
- A test order can be traced from Shopify to supplier confirmation and tracking.
- Duplicate supplier orders are prevented by idempotency and read-before-retry checks.
- Products failing quality, margin or shipping checks remain unpublished or paused.
- No credentials or customer-sensitive information are committed to Git.

## Not included in this phase

- A multi-vendor marketplace with third-party sellers.
- Custom headless storefront.
- Automatic supplier payments without review.
- Paid AI services or paid monitoring infrastructure.
- Assumption that any supplier app, MCP server or free tier is free for all features or destinations.
