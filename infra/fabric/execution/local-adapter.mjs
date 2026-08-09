import { validateTask } from './task-contract.mjs';

export function plan(task) {
  return { provider: 'local', task: validateTask(task) };
}
