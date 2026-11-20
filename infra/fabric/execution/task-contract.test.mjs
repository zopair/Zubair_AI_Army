import { describe, expect, it } from 'vitest';
import { validateTask } from './task-contract.mjs';

describe('typed task contract', () => {
  it('accepts a registered operation and strips executable fields', () => {
    const task = validateTask({
      id: 'repo-check',
      operation: 'node_version',
      command: 'bash',
      args: ['-lc', 'unsafe'],
      cwd: '/tmp'
    });
    expect(task).toEqual({ id: 'repo-check', operation: 'node_version' });
  });

  it('rejects missing or unregistered operations', () => {
    expect(() => validateTask({ id: 'x' })).toThrow(/operation is required/);
    expect(() => validateTask({ id: 'x', operation: 'arbitrary-shell' })).toThrow(/operation not allowed/);
  });

  it('rejects malformed task identifiers', () => {
    expect(() => validateTask({ id: '../escape', operation: 'node_version' })).toThrow(/invalid task id/);
  });
});
