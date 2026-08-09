export class AgentPerformanceMemory {
  constructor(records = []) {
    this.records = new Map();
    for (const record of records) this.record(record);
  }

  record({ agentId, taskType, success, cost = 0, latencyMs = 0, risk = 0 }) {
    if (!agentId || !taskType) throw new Error('agentId and taskType are required');
    const key = `${agentId}:${taskType}`;
    const current = this.records.get(key) ?? {
      agentId,
      taskType,
      attempts: 0,
      successes: 0,
      totalCost: 0,
      totalLatencyMs: 0,
      maxRisk: 0,
    };

    current.attempts += 1;
    if (success) current.successes += 1;
    current.totalCost += Number(cost) || 0;
    current.totalLatencyMs += Number(latencyMs) || 0;
    current.maxRisk = Math.max(current.maxRisk, Number(risk) || 0);
    this.records.set(key, current);
    return this.summary(agentId, taskType);
  }

  summary(agentId, taskType) {
    const record = this.records.get(`${agentId}:${taskType}`);
    if (!record) return null;
    return {
      ...record,
      successRate: record.successes / Math.max(1, record.attempts),
      averageCost: record.totalCost / Math.max(1, record.attempts),
      averageLatencyMs: record.totalLatencyMs / Math.max(1, record.attempts),
    };
  }

  rank(agentIds, taskType) {
    return agentIds
      .map(agentId => this.summary(agentId, taskType))
      .filter(Boolean)
      .sort((a, b) => (b.successRate - a.successRate) || (a.averageCost - b.averageCost) || (a.averageLatencyMs - b.averageLatencyMs));
  }

  export() {
    return [...this.records.values()].map(record => this.summary(record.agentId, record.taskType));
  }
}
