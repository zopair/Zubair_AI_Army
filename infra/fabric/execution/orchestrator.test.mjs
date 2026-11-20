import assert from 'node:assert/strict';
import { registerProvider } from './provider-registry.mjs';
import { executeTask } from './orchestrator.mjs';
import * as local from './local-adapter.mjs';

registerProvider('local', local);
const task = { id: 'smoke', operation: 'node_version' };
const result = await executeTask(task, {
  provider: 'local',
  execute: async plan => ({
    exitCode: 0,
    stdout: JSON.stringify(plan.task)
  })
});
assert.equal(result.status, 'succeeded');
assert.equal(result.provider, 'local');
assert.equal(result.exitCode, 0);
assert.equal(result.attempts, 1);
assert.equal(JSON.parse(result.stdout).operation, 'node_version');
console.log('orchestrator integration checks passed');
