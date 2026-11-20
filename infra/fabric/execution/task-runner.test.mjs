import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import test from 'node:test';
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

test('runs a fixed operation without accepting caller command or arguments', async () => {
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

  assert.equal(result.code, 0);
  assert.equal(result.stdout, 'v22.0.0');
  assert.equal(invocation.command, 'node');
  assert.deepEqual(invocation.args, ['--version']);
  assert.equal(invocation.options.shell, false);
  assert.equal(invocation.options.env.SECRET_TOKEN, undefined);
});

test('rejects unregistered operations before spawning a process', async () => {
  let spawned = false;
  await assert.rejects(
    runTask({
      operation: 'arbitrary-command',
      spawnImpl: () => { spawned = true; }
    }),
    /operation not allowed/
  );
  assert.equal(spawned, false);
});

test('terminates a task that exceeds its execution timeout', async () => {
  let child;
  await assert.rejects(
    runTask({
      operation: 'node_version',
      timeoutMs: 10,
      spawnImpl: () => {
        child = fakeChild();
        return child;
      }
    }),
    /timed out/
  );
  assert.ok(child.killedWith.includes('SIGTERM'));
});

test('terminates a task that exceeds the combined output limit', async () => {
  let child;
  await assert.rejects(
    runTask({
      operation: 'node_version',
      maxOutputBytes: 4,
      spawnImpl: () => {
        child = fakeChild({ output: '12345' });
        return child;
      }
    }),
    /output limit/
  );
  assert.ok(child.killedWith.includes('SIGTERM'));
});
