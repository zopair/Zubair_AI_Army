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
  taskType: 'coding',
  capabilities: ['coding', 'testing'],
  requiredPermissions: ['read:repo', 'write:workspace', 'execute:test'],
}, async (agent, task, skill) => ({ output: `${agent.id}:${skill.id}:${task.id}:ok` }));

assert.equal(result.agent.id, 'builder-01');
assert.equal(result.skill.id, 'software-build');
assert.equal(result.verdict.passed, true);
assert.deepEqual(result.audit.map(x => x.event), [
  'task.received',
  'skill.selected',
  'agent.selected',
  'agent.completed',
  'judge.verdict',
  'performance.updated',
]);
assert.equal(army.performance.summary('builder-01', 'coding').successRate, 1);

const ranked = army.performance.rank(['builder-01'], 'coding');
assert.equal(ranked[0].successRate, 1);

console.log('ZOPAIR ARMY core tests: PASS');
