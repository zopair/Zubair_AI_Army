export function validateTask(task) {
  if (!task || typeof task !== 'object') throw new Error('task must be an object');
  if (!task.id || !/^[a-z0-9._-]+$/.test(task.id)) throw new Error('invalid task id');
  if (!task.command || typeof task.command !== 'string') throw new Error('command is required');
  if (task.args !== undefined && (!Array.isArray(task.args) || task.args.some(a => typeof a !== 'string'))) throw new Error('args must be strings');
  return Object.freeze({ id: task.id, command: task.command, args: task.args ?? [], cwd: task.cwd ?? process.cwd() });
}
