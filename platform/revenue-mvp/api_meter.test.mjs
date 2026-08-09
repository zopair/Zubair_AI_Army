import assert from 'node:assert/strict';
import { meterUsage } from './api_meter.mjs';
const event = meterUsage({ productId: 'json-cleaner', customerId: 'cust-1', units: 25, unitPriceUsd: 0.01 });
assert.equal(event.amountUsd, 0.25);
assert.throws(() => meterUsage({ productId: 'x', customerId: 'y', units: 0, unitPriceUsd: 1 }));
console.log('usage metering checks passed');
