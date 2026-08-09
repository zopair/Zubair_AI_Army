import { SkillRegistry, DEFAULT_SKILLS } from './skill_registry.mjs';
import { AgentPerformanceMemory } from './performance_memory.mjs';

const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));

export const AGENTS = [
  { id: 'scout-01', role: 'scout', capabilities: ['research', 'discovery', 'api-discovery'], reliability: 0.94, cost: 0.10, latency: 0.45, risk: 0.10, permissions: ['read:web', 'read:repo'] },
  { id: 'builder-01', role: 'builder', capabilities: ['coding', 'implementation', 'testing'], reliability: 0.96, cost: 0.35, latency: 0.80, risk: 0.18, permissions: ['read:repo', 'write:workspace', 'execute:test'] },
  { id: 'operator-01', role: 'operator', capabilities: ['api', 'browser', 'automation'], reliability: 0.91, cost: 0.25, latency: 0.65, risk: 0.32, permissions: ['read:web', 'network:outbound'] },
  { id: 'guardian-01', role: 'guardian', capabilities: ['security', 'policy', 'audit'], reliability: 0.98, cost: 0.20, latency: 0.50, risk: 0.04, permissions: ['read:repo', 'read:policy'] },
];

export const capabilityScore = (agent, task, history = null) => {
  const requested = task.capabilities ?? [];
  const match = requested.filter(c => agent.capabilities.includes(c)).length / Math.max(1, requested.length);
  const reliability = agent.reliability;
  const speed = 1 - clamp(agent.latency / 2);
  const economy = 1 - clamp(agent.cost);
  const safety = 1 - clamp(agent.risk);
  const permissionsOk = (task.requiredPermissions ?? []).every(p => agent.permissions.includes(p));
  if (!permissionsOk) return -Infinity;

  const prior = history?.summary(agent.id, task.taskType ?? task.capabilities?.[0] ?? 'general');
  const learnedReliability = prior ? prior.successRate : reliability;
  const learnedEconomy = prior ? 1 - clamp(prior.averageCost) : economy;
  const learnedSpeed = prior ? 1 - clamp(prior.averageLatencyMs / 2000) : speed;

  return (0.34 * match)
    + (0.22 * learnedReliability)
    + (0.12 * learnedSpeed)
    + (0.12 * learnedEconomy)
    + (0.20 * safety);
};

export const selectAgent = (agents, task, history = null) => {
  const ranked = agents
    .map(agent => ({ agent, score: capabilityScore(agent, task, history) }))
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
  constructor({ agents = AGENTS, judge = null, skills = DEFAULT_SKILLS, performance = null } = {}) {
    this.agents = agents;
    this.skills = new SkillRegistry(skills);
    this.performance = performance ?? new AgentPerformanceMemory();
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

    const skillCandidates = this.skills.findForTask(task);
    if (!skillCandidates.length) {
      throw new Error(`No eligible skill for task: ${task.id}`);
    }
    const skill = skillCandidates[0].skill;
    this.log('skill.selected', { taskId: task.id, skillId: skill.id, fit: skillCandidates[0].fit });

    const selected = selectAgent(this.agents, task, this.performance);
    this.log('agent.selected', { taskId: task.id, agentId: selected.agent.id, score: selected.score });

    const started = Date.now();
    let result;
    let success = false;
    try {
      result = await worker(selected.agent, task, skill);
      success = Boolean(result?.output);
      this.log('agent.completed', {
        taskId: task.id,
        agentId: selected.agent.id,
        durationMs: Date.now() - started,
      });
    } catch (error) {
      this.log('agent.failed', { taskId: task.id, agentId: selected.agent.id, error: String(error?.message ?? error) });
      this.performance.record({
        agentId: selected.agent.id,
        taskType: task.taskType ?? task.capabilities?.[0] ?? 'general',
        success: false,
        cost: selected.agent.cost,
        latencyMs: Date.now() - started,
        risk: selected.agent.risk,
      });
      throw error;
    }

    const verdict = this.judge(task, result);
    success = Boolean(verdict.passed && success);
    this.performance.record({
      agentId: selected.agent.id,
      taskType: task.taskType ?? task.capabilities?.[0] ?? 'general',
      success,
      cost: selected.agent.cost,
      latencyMs: Date.now() - started,
      risk: selected.agent.risk,
    });
    this.log('judge.verdict', { taskId: task.id, ...verdict });
    this.log('performance.updated', { taskId: task.id, agentId: selected.agent.id, success });

    return { task, skill, agent: selected.agent, result, verdict, audit: [...this.audit] };
  }
}
