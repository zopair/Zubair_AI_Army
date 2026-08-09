#!/usr/bin/env node
import { ProductRuntime } from './product_runtime.mjs';

const input = process.argv.slice(2).join(' ').trim();
if (!input) {
  console.error('Usage: node zopair_army/cli.mjs "your task"');
  process.exit(2);
}

const runtime = new ProductRuntime({
  router: async () => ({ agentId: 'local-builder', skillId: 'general-task' }),
  executor: async (_assignment, task) => ({ answer: `Local execution completed for: ${task}` }),
  judge: async ({ result }) => ({ success: Boolean(result?.answer), score: result?.answer ? 1 : 0, feedback: 'local baseline verified' }),
  audit: event => console.error(JSON.stringify(event)),
});

const output = await runtime.run(input);
console.log(JSON.stringify(output, null, 2));
process.exit(output.status === 'completed' ? 0 : 1);
