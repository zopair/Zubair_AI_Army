# Pink & Red Market — Supplier and Market Pilot (Egypt + GCC)

## Market decision

Target markets are Egypt and the six GCC countries. Do not assume one supplier or one shipping lane is suitable for every country.

## Supplier shortlist and usage policy

### Egypt

1. DSers + AliExpress suppliers: candidate for cross-border SKU discovery and comparison. For each SKU, set destination to Egypt and record product price, shipping method, shipping price, delivery estimate, seller rating, tracking and variant mapping before approval.
2. Safqa / Ordratk: candidate local Egyptian catalog and fulfillment source. Public website claims 10,000+ products, COD and nationwide shipping. Shopify/API integration, product cost, delivery/return fees, settlement and supplier identity must be verified directly before committing.
3. Local courier/3PL candidates (not product suppliers): Bosta, Mylerz, TTurbo, Flextock, Khazenly. Obtain written merchant quotes for delivery, COD, reverse logistics, storage/pick-pack, remote areas and Shopify integration. Public comparison-site ranges are indicative only, not contractual offers.

### GCC

1. GulfCOD: candidate COD supplier network across UAE, Saudi Arabia, Kuwait, Qatar, Bahrain and Oman. Publicly listed delivery charges:
   - UAE: 18 AED; return: 5 AED
   - Saudi Arabia: 26 SAR; return: 8 SAR
   - Kuwait: 2.5 KWD; return: 1.27 KWD
   - Qatar: 25 QAR; return: 5 QAR
   - Oman: 2.8 OMR; return: 1.26 OMR
   - Bahrain: 2.2 BHD; return: 1.3 BHD
   Public payout policy states a 4.5% platform fee on delivered COD amount, weekly payout cycle, and AED 190 minimum payout threshold. Treat all figures as published platform information, not a negotiated quote. Verify product costs, remote-area surcharges, return rules, supplier-level stock, payout eligibility, seller country eligibility and API/Shopify integration.
2. Gulf Dropship: secondary comparison candidate. Obtain a written quote and validate the supplier, settlement, returns, tracking and Shopify/API capabilities before use.
3. DSers/AliExpress and CJdropshipping: use only when a product-specific shipping quote, trackable service, delivery promise and dispute coverage are confirmed for the exact destination country.

### CJdropshipping country restriction

CJ's published dispute policy lists Bahrain, Kuwait, Oman and Qatar among destination countries where it will not accept disputes due to international transportation limitations. Do not route pilot orders to those countries through CJ. For other destinations, verify the selected shipping method and current coverage before publishing.

## Shipping and customs rules

- There is no universal shipping price. Obtain a live quote per SKU, variant, destination country/postcode, packed weight and dimensions.
- Egypt cross-border import costs can include product, freight, insurance, duties, taxes, clearance and carrier fees. HS code, country of origin, customs valuation and import purpose affect the outcome. Obtain a broker/carrier landed-cost quote before selling.
- For GCC, distinguish local/regional stock from China-origin direct shipping. Prefer local/regional fulfillment for pilot products where the supplier's proof of stock, dispatch SLA, tracking, returns and customer support are verified.
- Public delivery estimates are not guarantees. Buy test samples and measure actual dispatch and delivery times.
- Shopify's dropshipping guidance requires clear processing/shipping disclosures, import fee disclosures where applicable, and seller responsibility for product safety and compliance.

## Product test plan

### Pilot scope

Start with 12 SKUs total:
- 6 low-risk, lightweight products sourced locally for Egypt.
- 6 low-risk products available from a verified GCC supplier network.
- Avoid initially: cosmetics/skin-contact formulations, supplements, food, batteries/electronics with certification needs, branded/counterfeit-risk goods, fragile glass, oversized products and products with complex sizing.
- Use 2–3 categories only, not all ten collections at once.

### Candidate categories

- Home organization and simple decor
- Hair/accessory tools without electrical components
- Stationery and gift accessories
- Non-fragile party supplies

### Per-SKU approval checklist

A product is not published until it has:
- Supplier legal identity and reachable support contact.
- Supplier SKU and exact variant mapping.
- Written confirmation of available stock and stock refresh frequency.
- Product cost and currency.
- Destination-specific shipping quote and dispatch/delivery estimate.
- Tracking availability and sample tracking verification.
- Return, refusal, damaged-item and lost-parcel rules.
- Product safety/compliance check and truthful images/description.
- Landed cost and target contribution margin calculation.
- Sample order received and quality checked.

### Controlled experiment

1. Days 1–3: supplier onboarding, written quotations, destination-specific shipping checks and 3–4 sample orders.
2. Days 4–7: build 12 draft listings, localize Arabic/English copy, calculate price floors, and verify checkout/shipping disclosures.
3. Days 8–21: publish a controlled subset, test organic content and small capped ad experiments only after payment and fulfillment readiness. Use manual supplier approval for every order.
4. Days 22–30: compare delivered orders, cancellation/refusal rate, actual delivery time, gross contribution after shipping/returns/platform fees, and customer complaints. Pause SKUs with negative contribution or unreliable fulfillment.

### Suggested internal pilot gates (management targets, not market facts)

- 100% of live variants mapped to a named supplier and supplier SKU.
- 100% of pilot orders have an auditable supplier confirmation and tracking/status record.
- Target on-time delivery at least 90% after a meaningful sample; review after the first 20 delivered orders per lane.
- Target cancellation/refusal/return rate below 15%; investigate any SKU above 20%.
- Target positive contribution margin after supplier cost, shipping, platform fee, expected returns and payment costs.
- Do not scale based on clicks or orders alone; scale only after delivered-order economics are positive.

## Integration and automation policy

- Keep Shopify as the customer-facing system of record.
- Build supplier adapters behind a normalized supplier interface; avoid hard-coding GulfCOD, DSers, CJ or Safqa logic into Shopify product records.
- Start with manual order approval and CSV/manual dashboard fallback where no verified API exists.
- Automate stock/price sync and order routing only after API authorization, test orders and idempotency checks.
- Do not store supplier/customer credentials or personal data in GitHub.
- Record supplier country restrictions and route-block rules in configuration.

## Open verification items before supplier activation

- Confirm GulfCOD seller eligibility for a business registered in Egypt, payout destination/currency and any cross-border bank fees.
- Confirm GulfCOD API, Shopify app or webhook availability; until confirmed, assume manual dashboard entry.
- Confirm Safqa/Ordratk Shopify app/API, exact supplier and return costs, settlement, and whether seller controls customer price and branding.
- Obtain current written Egypt courier quotes and commercial-import advice for any direct-import SKUs.
- Obtain country-specific quotes from DSers suppliers and CJ for each exact product and destination; never infer shipping cost from another SKU or country.
