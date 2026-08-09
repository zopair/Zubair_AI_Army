import { BENCHMARK_TASKS, createContractAdapter, summarizeRuns } from './framework_adapters.mjs';

const deterministic = createContractAdapter('zopair-core', async task => ({
  taskId: task.id,
  category: task.category,
  strategy: 'framework-neutral',
  completed: true,
}));

const adapters = [deterministic];
const runs = [];

for (const adapter of adapters) {
  for (const task of BENCHMARK_TASKS) {
    runs.push(await adapter.run(task));
  }
}

console.log(JSON.stringify({
  methodology: {
    sameTasks: true,
    sameInputs: true,
    scoreWeights: { reliability: 0.70, latency: 0.30 },
    rule: 'Do not rank frameworks until their native adapters are installed and executed under the same environment.',
  },
  results: summarizeRuns(runs),
  runs,
}, null, 2));
