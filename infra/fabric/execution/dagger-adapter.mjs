import { validateTask } from './task-contract.mjs';

/**
 * Provider-neutral Dagger adapter boundary.
 * The adapter intentionally emits a plan first; the runtime integration can
 * later execute the plan through the installed Dagger SDK/CLI.
 */
export function createDaggerPlan(task, options = {}) {
  const valid = validateTask(task);
  return Object.freeze({
    provider: 'dagger',
    task: valid,
    container: options.container ?? 'node:20-bookworm-slim',
    network: options.network ?? 'none',
    cache: options.cache ?? 'workspace',
    artifactPolicy: options.artifactPolicy ?? 'capture-on-success',
  });
}
