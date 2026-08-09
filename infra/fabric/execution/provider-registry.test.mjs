import assert from 'node:assert/strict';
import { registerProvider, getProvider, listProviders } from './provider-registry.mjs';

registerProvider('test-provider', { plan: task => ({ task }) });
assert.deepEqual(listProviders(), ['test-provider']);
assert.equal(getProvider('test-provider').plan({ id: 'x' }).task.id, 'x');
assert.throws(() => registerProvider('bad name', {}), /invalid provider name/);
assert.throws(() => getProvider('missing'), /not registered/);
console.log('provider registry checks passed');
