import assert from 'node:assert/strict';
import { scoreOpportunity, decision } from './product-score.mjs';
const score = scoreOpportunity({ demand: 90, buildEase: 90, competition: 20, monetization: 85 });
assert.ok(score >= 75);
assert.equal(decision(score), 'BUILD');
assert.equal(decision(40), 'BACKLOG');
console.log('product factory scoring checks passed');
