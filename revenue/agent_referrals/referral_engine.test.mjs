import assert from 'node:assert/strict';
import { calculateReward, isEligible } from './referral_engine.mjs';

assert.equal(calculateReward({ netRevenueUsd: 100 }), 10);
assert.equal(calculateReward({ netRevenueUsd: 100, rewardRate: 0.2, capUsd: 15 }), 15);
assert.equal(calculateReward({ netRevenueUsd: 0 }), 0);
assert.equal(isEligible({ paid: true }), true);
assert.equal(isEligible({ paid: true, refunded: true }), false);
assert.equal(isEligible({ paid: true, selfReferral: true }), false);
console.log('agent referral tests passed');
