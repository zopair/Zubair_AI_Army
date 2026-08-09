import assert from 'node:assert/strict';
import { RevenuePolicy } from './revenue_policy.mjs';

const policy = new RevenuePolicy();
assert.equal(policy.approveExpense({ amount: 5, type: 'api' }).approved, true);
assert.equal(policy.approveExpense({ amount: 100, type: 'api' }).approved, false);
assert.equal(policy.approveExpense({ amount: 1, type: 'trading' }).approved, false);
assert.equal(policy.canScale({ revenue: 20, variableCost: 10, quality: 0.95, securityHealthy: true }).approved, true);
assert.equal(policy.canScale({ revenue: 5, variableCost: 10, quality: 0.99, securityHealthy: true }).approved, false);
assert.equal(policy.canScale({ revenue: 20, variableCost: 10, quality: 0.99, securityHealthy: false }).approved, false);
console.log('revenue policy checks passed');
