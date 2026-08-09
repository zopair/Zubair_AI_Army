# Document Normalize API

`POST /api/v1/normalize`

Headers:

`Authorization: Bearer <ZOPAIR_API_KEY>`

JSON body:

```json
{"text":"  hello   world\n\n\nnext line "}
```

The endpoint normalizes line endings, collapses repeated whitespace and excessive blank lines, and returns a request ID plus metered usage.

Environment:

- `ZOPAIR_API_KEY` — required secret.
- `NORMALIZE_UNIT_PRICE_USD` — price per 1,000 output characters; default `0.01`.
- `NORMALIZE_MAX_CHARS` — maximum input size; default `50000`.

No payment processor is implied by this endpoint yet. Usage is metered into the revenue ledger so a payment rail can be added after the service passes operational tests.
