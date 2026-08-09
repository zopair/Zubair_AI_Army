import assert from 'node:assert/strict';
import { createReferral, attributePurchase } from './referral_flow.mjs';

const now = new Date('2026-08-09T00:00:00Z');
const referral = createReferral({ agentId: 'agent-1', productId: 'json-cleaner', now });
const valid = attributePurchase({ referral, customerId: 'customer-1', amount: 100, now });
assert.equal(valid.eligible, true);
assert.equal(valid.reward, 10);

const refund = attributePurchase({ referral, customerId: 'customer-2', amount: 100, now, refunded: true });
assert.equal(refund.eligible, false);

const expired = attributePurchase({ referral, customerId: 'customer-3', amount: 100, now: new Date('2026-09-10T00:00:00Z') });
assert.equal(expired.eligible, false);

console.log('referral flow checks passed');
