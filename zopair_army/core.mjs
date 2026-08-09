const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));

export const AGENTS = [
  { id: 'scout-01', role: 'scout', capabilities: ['research', 'discovery', 'api-discovery'], reliability: 0.94, cost: 0.10, latency: 0.45, risk: 0.10, permissions: ['read:web', 'read:repo'] },
  { id: 'builder-01', role: 'builder', capabilities: ['coding', 'implementation', 'testing'], reliability: 0.96, cost: 0.35, latency: 0.80, risk: 0.18, permissions: ['read:repo', 'write:workspace', 'execute:test'] },
  { id: 'operator-01', role: 'operator', capabilities: ['api', 'browser', 'automation'], reliability: 0.91, cost: 0.25, latency: 0.65, risk: 0.32, permissions: ['read:web', 'network:outbound'] },
  { id: 'guardian-01', role: 'guardian', capabilities: ['security', 'policy', 'audit'], reliability: 0.98, cost: 0.20, latency: 0.50, risk: 0.04, permissions: ['read:repo', 'read:policy'] },
];

export const capabilityScore = (agent, task) => {
  const match = task.capabilities.filter(c => agent.capabilities.includes(c)).length / Math.max(1, task.capabilities.length);
  const reliability = agent.reliability;
  const speed = 1 - clamp(agent.latency / 2);
  const economy = 1 - clamp(agent.cost);
  const safety = 1 - clamp(agent.risk);
  const permissionsOk = (task.requiredPermissions ?? []).every(p => agent.permissions.includes(p));
  if (!permissionsOk) return -Infinity;
  return (0.40 * match) + (0.22 * reliability) + (0.12 * speed) + (0.10 * economy) + (0.16 * safety);
};

export const selectAgent = (agents, task) => {
  const ranked = agents
    .map(agent => ({ agent, score: capabilityScore(agent, task) }))
    .filter(x => Number.isFinite(x.score))
    .sort((a, b) => b.score - a.score);
  if (!ranked.length) throw new Error(`No eligible agent for task: ${task.id}`);
  return ranked[0];
};

export const createAudit = (event, data = {}) => ({
  timestamp: new Date().toISOString(),
  event,
  ...data,
});

export class ZopairArmy {
  constructor({ agents = AGENTS, judge = null } = {}) {
    this.agents = agents;
    this.judge = judge ?? ((task, result) => ({
      passed: Boolean(result?.output),
      score: result?.output ? 1 : 0,
      reason: result?.output ? 'result-present' : 'empty-result',
    }));
    this.audit = [];
  }

  log(event, data) {
    const record = createAudit(event, data);
    this.audit.push(record);
    return record;
  }

  async execute(task, worker) {
    this.log('task.received', { taskId: task.id, capabilities: task.capabilities });

    const selected = selectAgent(this.agents, task);
    this.log('agent.selected', { taskId: task.id, agentId: selected.agent.id, score: selected.score });

    const started = Date.now();
    let result;
    try {
      result = await worker(selected.agent, task);
      this.log('agent.completed', {
        taskId: task.id,
        agentId: selected.agent.id,
        durationMs: Date.now() - started,
      });
    } catch (error) {
      this.log('agent.failed', { taskId: task.id, agentId: selected.agent.id, error: String(error?.message ?? error) });
      throw error;
    }

    const verdict = this.judge(task, result);
    this.log('judge.verdict', { taskId: task.id, ...verdict });

    return { task, agent: selected.agent, result, verdict, audit: [...this.audit] };
  }
}

// Deterministic smoke test. No network, credentials or paid services.
if (import.meta.url === `file://${process.argv[1]}`) {
  const army = new ZopairArmy();
  const task = {
    id: 'smoke-001',
    capabilities: ['research', 'api-discovery'],
    requiredPermissions: ['read:web'],
  };

  const run = await army.execute(task, async (agent) => ({
    output: `${agent.role} completed deterministic smoke task`,
  }));

  console.log(JSON.stringify({
    selectedAgent: run.agent.id,
    verdict: run.verdict,
    auditEvents: run.audit.map(x => x.event),
  }, null, 2));
}
