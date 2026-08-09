import assert from 'node:assert/strict';
import { registerProvider } from './provider-registry.mjs';
import { executeTask } from './orchestrator.mjs';
import * as local from './local-adapter.mjs';

registerProvider('local', local);
const task = { id: 'smoke', command: 'node', args: ['-e', 'process.stdout.write("fabric-ok")'] };
const result = await executeTask(task, { provider: 'local', execute: async plan => ({ exitCode: 0, stdout: JSON.stringify(plan.task) }) });
assert.equal(result.status, 'succeeded');
assert.equal(result.provider, 'local');
assert.equal(result.exitCode, 0);
assert.equal(result.attempts, 1);
console.log('orchestrator integration checks passed');
