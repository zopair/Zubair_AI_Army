import assert from 'node:assert/strict';
import { ProductRuntime } from './product_runtime.mjs';

const events = [];
const runtime = new ProductRuntime({
  router: async task => ({ agentId: task.includes('code') ? 'builder' : 'scout', skillId: 'general' }),
  executor: async (assignment, task) => ({ assignment, task, output: 'ok' }),
  judge: async ({ result }) => ({ success: result.output === 'ok', score: 1, feedback: 'verified' }),
  audit: event => events.push(event),
});

const result = await runtime.run('write code');
assert.equal(result.status, 'completed');
assert.equal(result.agentId, 'builder');
assert.equal(result.verdict.success, true);
assert(events.some(e => e.type === 'task.received'));
assert(events.some(e => e.type === 'judged'));
console.log('product runtime checks passed');
