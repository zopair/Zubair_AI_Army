import { EventEmitter } from 'node:events';
import { describe, expect, it } from 'vitest';
import { runTask } from './task-runner.mjs';

function fakeChild({ output = '', closeCode = 0 } = {}) {
  const child = new EventEmitter();
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  child.killedWith = [];
  child.kill = (signal) => {
    child.killedWith.push(signal);
    queueMicrotask(() => child.emit('close', closeCode));
    return true;
  };
  if (output) {
    queueMicrotask(() => {
      child.stdout.emit('data', Buffer.from(output));
      if (!child.killedWith.length) child.emit('close', closeCode);
    });
  }
  return child;
}

describe('bounded task runner', () => {
  it('runs a fixed operation without accepting caller command or arguments', async () => {
    let invocation;
    const result = await runTask({
      operation: 'node_version',
      command: 'bash',
      args: ['-lc', 'echo unsafe'],
      env: { SECRET_TOKEN: 'must-not-pass' },
      spawnImpl: (command, args, options) => {
        invocation = { command, args, options };
        return fakeChild({ output: 'v22.0.0' });
      }
    });

    expect(result.code).toBe(0);
    expect(result.stdout).toBe('v22.0.0');
    expect(invocation.command).toBe('node');
    expect(invocation.args).toEqual(['--version']);
    expect(invocation.options.shell).toBe(false);
    expect(invocation.options.env.SECRET_TOKEN).toBeUndefined();
  });

  it('rejects unregistered operations before spawning a process', async () => {
    let spawned = false;
    await expect(runTask({
      operation: 'arbitrary-command',
      spawnImpl: () => { spawned = true; }
    })).rejects.toThrow(/operation not allowed/);
    expect(spawned).toBe(false);
  });

  it('terminates a task that exceeds its execution timeout', async () => {
    let child;
    await expect(runTask({
      operation: 'node_version',
      timeoutMs: 10,
      spawnImpl: () => {
        child = fakeChild();
        return child;
      }
    })).rejects.toThrow(/timed out/);
    expect(child.killedWith).toContain('SIGTERM');
  });

  it('terminates a task that exceeds the combined output limit', async () => {
    let child;
    await expect(runTask({
      operation: 'node_version',
      maxOutputBytes: 4,
      spawnImpl: () => {
        child = fakeChild({ output: '12345' });
        return child;
      }
    })).rejects.toThrow(/output limit/);
    expect(child.killedWith).toContain('SIGTERM');
  });
});
