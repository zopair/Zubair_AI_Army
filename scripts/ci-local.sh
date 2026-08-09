#!/usr/bin/env bash
set -euo pipefail
node platform/factory/product-score.test.mjs
node platform/revenue-mvp/api_meter.test.mjs
node revenue/agent_sales/referral_flow.test.mjs
node revenue/ledger/settlement.test.mjs
printf '\nLocal deterministic CI passed.\n'
