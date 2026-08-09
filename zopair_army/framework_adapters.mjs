const OPTIONAL_COMMANDS = [
  { id: 'langgraph', command: 'langgraph' },
  { id: 'autogen', command: 'autogen' },
  { id: 'crewai', command: 'crewai' },
];

export class FrameworkAdapter {
  constructor({ id, version = 'unknown', execute }) {
    this.id = id;
    this.version = version;
    this.execute = execute;
  }

  async run(task) {
    const started = Date.now();
    try {
      const result = await this.execute(task);
      return {
        adapter: this.id,
        version: this.version,
        taskId: task.id,
        ok: true,
        latencyMs: Date.now() - started,
        output: result,
      };
    } catch (error) {
      return {
        adapter: this.id,
        version: this.version,
        taskId: task.id,
        ok: false,
        latencyMs: Date.now() - started,
        error: String(error?.message ?? error),
      };
    }
  }
}

export function createContractAdapter(id, execute, metadata = {}) {
  return new FrameworkAdapter({ id, execute, version: metadata.version ?? 'contract' });
}

export function unavailableAdapters() {
  return OPTIONAL_COMMANDS.map(item => ({
    ...item,
    available: false,
    reason: 'Framework dependency is optional; install it in an isolated benchmark environment before claiming a runtime comparison.',
  }));
}

export const BENCHMARK_TASKS = [
  { id: 'research-01', category: 'research', goal: 'Decompose a bounded research question and return cited findings.', timeoutMs: 30000 },
  { id: 'coding-01', category: 'coding', goal: 'Implement a small deterministic function and provide tests.', timeoutMs: 30000 },
  { id: 'routing-01', category: 'routing', goal: 'Choose the lowest-risk capable worker from a fixed registry.', timeoutMs: 30000 },
  { id: 'recovery-01', category: 'recovery', goal: 'Recover from one failed worker without losing task state.', timeoutMs: 30000 },
];

export function scoreRun(run) {
  const reliability = run.ok ? 1 : 0;
  const latencyScore = 1 / (1 + Math.max(0, run.latencyMs) / 1000);
  return (0.70 * reliability) + (0.30 * latencyScore);
}

export function summarizeRuns(runs) {
  const byAdapter = new Map();
  for (const run of runs) {
    const current = byAdapter.get(run.adapter) ?? { adapter: run.adapter, runs: 0, successes: 0, latencyMs: 0, score: 0 };
    current.runs += 1;
    current.successes += run.ok ? 1 : 0;
    current.latencyMs += run.latencyMs;
    current.score += scoreRun(run);
    byAdapter.set(run.adapter, current);
  }
  return [...byAdapter.values()].map(item => ({
    ...item,
    successRate: item.successes / Math.max(1, item.runs),
    averageLatencyMs: item.latencyMs / Math.max(1, item.runs),
    averageScore: item.score / Math.max(1, item.runs),
  })).sort((a, b) => b.averageScore - a.averageScore);
}
