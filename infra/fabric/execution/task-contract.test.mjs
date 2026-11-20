import assert from 'node:assert/strict';
import test from 'node:test';
import { validateTask } from './task-contract.mjs';

test('accepts a registered operation and strips executable fields', () => {
  const task = validateTask({
    id: 'repo-check',
    operation: 'node_version',
    command: 'bash',
    args: ['-lc', 'unsafe'],
    cwd: '/tmp'
  });
  assert.deepEqual(task, { id: 'repo-check', operation: 'node_version' });
});

test('rejects missing or unregistered operations', () => {
  assert.throws(() => validateTask({ id: 'x' }), /operation is required/);
  assert.throws(() => validateTask({ id: 'x', operation: 'arbitrary-shell' }), /operation not allowed/);
});

test('rejects malformed task identifiers', () => {
  assert.throws(() => validateTask({ id: '../escape', operation: 'node_version' }), /invalid task id/);
});
