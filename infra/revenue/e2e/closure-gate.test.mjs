import assert from 'node:assert/strict';
import { evaluate } from './closure-gate.mjs';

const required = [
  'product_published', 'visitor', 'lead', 'order', 'payment_verified',
  'entitlement', 'delivery', 'revenue_ledger', 'analytics_event', 'recovery'
];

const result = evaluate(required.map(type => ({ type })));
assert.equal(result.passed, true);
assert.deepEqual(result.missing, []);
console.log(`revenue closure smoke passed: ${required.length}/${required.length}`);
