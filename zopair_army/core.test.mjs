import assert from 'node:assert/strict';
import { ZopairArmy, AGENTS, selectAgent } from './core.mjs';

const discovery = selectAgent(AGENTS, {
  id: 't1',
  capabilities: ['research', 'api-discovery'],
  requiredPermissions: ['read:web'],
});
assert.equal(discovery.agent.id, 'scout-01');

const army = new ZopairArmy();
const result = await army.execute({
  id: 't2',
  capabilities: ['coding', 'testing'],
  requiredPermissions: ['read:repo', 'write:workspace', 'execute:test'],
}, async agent => ({ output: `${agent.id}:ok` }));

assert.equal(result.agent.id, 'builder-01');
assert.equal(result.verdict.passed, true);
assert.deepEqual(result.audit.map(x => x.event), [
  'task.received',
  'agent.selected',
  'agent.completed',
  'judge.verdict',
]);

console.log('ZOPAIR ARMY core tests: PASS');
