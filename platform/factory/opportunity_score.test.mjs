import assert from 'node:assert/strict';
import { opportunityScore } from './opportunity_score.mjs';
const score = opportunityScore({ demand: 90, competition: 20, buildEffort: 30, willingnessToPay: 80 });
assert.ok(score > 75);
assert.throws(() => opportunityScore({ demand: 101, competition: 0, buildEffort: 0, willingnessToPay: 0 }));
console.log('opportunity scoring checks passed');
