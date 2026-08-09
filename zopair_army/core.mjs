import { SkillRegistry, DEFAULT_SKILLS } from './skill_registry.mjs';
import { AgentPerformanceMemory } from './performance_memory.mjs';
import { DEFAULT_SKILL_POLICY } from './policy.mjs';

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

export const rankAgents = (agents, task, history = null) => agents
  .map(agent => ({ agent, score: capabilityScore(agent, task, history) }))
  .filter(x => Number.isFinite(x.score))
  .sort((a, b) => b.score - a.score);

export const selectAgent = (agents, task, history = null) => {
  const ranked = rankAgents(agents, task, history);
  if (!ranked.length) throw new Error(`No eligible agent for task: ${task.id}`);
  return ranked[0];
};

export const createAudit = (event, data = {}) => ({
  timestamp: new Date().toISOString(),
  event,
  ...data,
});

export class ZopairArmy {
  constructor({ agents = AGENTS, judge = null, skills = DEFAULT_SKILLS, performance = null, maxAttempts = 2, policy = DEFAULT_SKILL_POLICY } = {}) {
    this.agents = agents;
    this.skills = new SkillRegistry(skills);
    this.performance = performance ?? new AgentPerformanceMemory();
    this.maxAttempts = Math.max(1, maxAttempts);
    this.policy = policy;
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
    if (!skillCandidates.length) throw new Error(`No eligible skill for task: ${task.id}`);
    const skill = skillCandidates[0].skill;
    const policy = this.policy.canActivate(skill, { approval: Boolean(task.skillApproval) });
    if (!policy.allowed) {
      this.log('skill.blocked', { taskId: task.id, skillId: skill.id, reason: policy.reason });
      throw new Error(`Skill activation blocked: ${policy.reason}`);
    }
    this.log('skill.selected', { taskId: task.id, skillId: skill.id, fit: skillCandidates[0].fit, policy: policy.reason });

    const ranked = rankAgents(this.agents, task, this.performance);
    if (!ranked.length) throw new Error(`No eligible agent for task: ${task.id}`);

    const attempts = Math.min(this.maxAttempts, ranked.length);
    let lastError = null;

    for (let index = 0; index < attempts; index += 1) {
      const selected = ranked[index];
      const started = Date.now();
      this.log('agent.selected', { taskId: task.id, agentId: selected.agent.id, score: selected.score, attempt: index + 1 });

      let result;
      try {
        result = await worker(selected.agent, task, skill);
      } catch (error) {
        lastError = error;
        this.performance.record({
          agentId: selected.agent.id,
          taskType: task.taskType ?? task.capabilities?.[0] ?? 'general',
          success: false,
          cost: selected.agent.cost,
          latencyMs: Date.now() - started,
          risk: selected.agent.risk,
        });
        this.log('agent.failed', { taskId: task.id, agentId: selected.agent.id, attempt: index + 1, error: String(error?.message ?? error) });
        continue;
      }

      const verdict = this.judge(task, result);
      const success = Boolean(verdict.passed && result?.output);
      this.performance.record({
        agentId: selected.agent.id,
        taskType: task.taskType ?? task.capabilities?.[0] ?? 'general',
        success,
        cost: selected.agent.cost,
        latencyMs: Date.now() - started,
        risk: selected.agent.risk,
      });
      this.log('agent.completed', { taskId: task.id, agentId: selected.agent.id, durationMs: Date.now() - started, attempt: index + 1 });
      this.log('judge.verdict', { taskId: task.id, agentId: selected.agent.id, attempt: index + 1, ...verdict });
      this.log('performance.updated', { taskId: task.id, agentId: selected.agent.id, success });

      if (success) return { task, skill, agent: selected.agent, result, verdict, attempts: index + 1, audit: [...this.audit] };
      lastError = new Error(`Judge rejected result from ${selected.agent.id}: ${verdict.reason ?? 'unknown reason'}`);
    }

    throw lastError ?? new Error(`All eligible agents failed task: ${task.id}`);
  }
}
