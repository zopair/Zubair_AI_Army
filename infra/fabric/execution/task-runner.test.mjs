import assert from 'node:assert/strict';
import { runTask } from './task-runner.mjs';

const result = await runTask({ command: 'node', args: ['-e', 'process.stdout.write("zopair-fabric-ok")'] });
assert.equal(result.code, 0);
assert.equal(result.stdout, 'zopair-fabric-ok');
await assert.rejects(() => runTask({ command: 'bash', args: ['-lc', 'echo unsafe'] }), /command not allowed/);
console.log('task runner checks passed');
