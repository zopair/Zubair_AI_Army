import { validateTask } from './task-contract.mjs';
import { getProvider } from './provider-registry.mjs';
import { successResult, failureResult } from './result.mjs';
import { nextAttempt } from './retry-policy.mjs';

export async function executeTask(task, { provider = 'local', maxAttempts = 3, execute } = {}) {
  const valid = validateTask(task);
  const adapter = getProvider(provider);
  let attempt = 0;
  while (true) {
    try {
      const plan = adapter.plan(valid);
      if (typeof execute !== 'function') return successResult(valid, { provider, attempts: attempt + 1, stdout: JSON.stringify(plan) });
      const output = await execute(plan);
      return successResult(valid, { ...output, provider, attempts: attempt + 1 });
    } catch (error) {
      const errorCode = error.code ?? 'EXECUTION_FAILED';
      const retry = nextAttempt({ attempt, maxAttempts, errorCode });
      if (!retry) return failureResult(valid, error, { provider, attempts: attempt + 1 });
      attempt = retry.attempt;
      await new Promise(resolve => setTimeout(resolve, retry.backoffMs));
    }
  }
}
