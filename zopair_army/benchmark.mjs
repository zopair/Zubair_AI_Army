import { ZopairArmy, AGENTS } from './core.mjs';
import { DeterministicAdapter } from './adapters.mjs';

const adapter = new DeterministicAdapter();
const army = new ZopairArmy();
const tasks = [
  { id: 'bench-research', taskType: 'research', capabilities: ['research'], requiredPermissions: ['read:web'] },
  { id: 'bench-code', taskType: 'coding', capabilities: ['coding', 'testing'], requiredPermissions: ['read:repo', 'write:workspace', 'execute:test'] },
  { id: 'bench-browser', taskType: 'browser', capabilities: ['browser', 'automation'], requiredPermissions: ['read:web', 'network:outbound'], skillApproval: true },
  { id: 'bench-security', taskType: 'security', capabilities: ['security', 'audit'], requiredPermissions: ['read:repo', 'read:policy'] },
];

for (let round = 0; round < 5; round += 1) {
  for (const task of tasks) {
    await army.execute(task, (agent, currentTask) => adapter.execute(agent, currentTask));
  }
}

const summaries = army.performance.export();
const eligibleAgentIds = AGENTS.map(agent => agent.id);
const ranking = Object.fromEntries(
  tasks.map(task => [task.taskType, army.performance.rank(eligibleAgentIds, task.taskType)]),
);

console.log(JSON.stringify({
  rounds: 5,
  tasks: tasks.length,
  executions: tasks.length * 5,
  performanceSummaries: summaries,
  rankings: ranking,
  auditEvents: army.audit.length,
}, null, 2));
