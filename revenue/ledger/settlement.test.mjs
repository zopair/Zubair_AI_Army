import assert from 'node:assert/strict';
import { recordRevenue, createPendingSettlement, releaseSettlement } from './settlement.mjs';

const now = new Date('2026-08-09T00:00:00Z');
const referral = { id: 'ref_agent-1_json-cleaner_1', agentId: 'agent-1', productId: 'json-cleaner', customerId: 'customer-1' };
const revenue = recordRevenue({ requestId: 'req-1', customerId: 'customer-1', agentId: 'agent-1', productId: 'json-cleaner', amount: 100, variableCost: 20 });
assert.equal(revenue.ok, true);
assert.equal(revenue.event.netRevenue, 80);
const pending = createPendingSettlement({ referral, revenueEvent: revenue, now });
assert.equal(pending.ok, true);
assert.equal(pending.settlement.amount, 8);
assert.equal(releaseSettlement(pending, { now }), false);
assert.equal(releaseSettlement(pending, { now: new Date('2026-08-24T00:00:00Z') }).status, 'READY_TO_SETTLE');
assert.equal(releaseSettlement(pending, { now: new Date('2026-08-24T00:00:00Z'), chargeback: true }).ok, false);
console.log('ledger settlement checks passed');
