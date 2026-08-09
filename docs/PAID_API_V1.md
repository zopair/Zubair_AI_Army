# ZOPAIR Paid API v1 — Document Normalize

## Endpoint

`POST /api/v1/normalize`

Headers:

`Authorization: Bearer $ZOPAIR_API_KEY`

Body:

```json
{"text":"document text"}
```

The service normalizes line endings and whitespace, collapses excessive blank lines, and returns usage units plus a request ID.

## Metering

- 1 unit = up to 1,000 output characters.
- Default price is USD 0.01 per unit.
- Configure with `NORMALIZE_UNIT_PRICE_USD`.
- Maximum input is 50,000 characters by default; configure with `NORMALIZE_MAX_CHARS`.

## Accounting

Every successful request writes a `RevenueEvent` containing a hashed API key, units, gross revenue, variable cost, quality, status and metadata. No raw API key is persisted.

## Important launch boundary

This is a **metering-ready** paid API, not a claim that payment collection is already live. A payment provider or signed credit system must be connected before charging external customers. Until then, use a test key and internal dogfooding.

## Launch gates

1. Prisma migration succeeds.
2. Auth rejects missing/incorrect keys.
3. Valid requests return deterministic normalized output.
4. Revenue events are recorded exactly once per request ID.
5. Load/latency and cost are measured.
6. A payment rail is connected only after the API passes internal smoke tests.
