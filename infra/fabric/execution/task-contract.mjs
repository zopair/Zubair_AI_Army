const ALLOWED_OPERATIONS = new Set([
  'node_version',
  'npm_test',
  'npm_build',
  'python_compile'
]);

export function validateTask(task) {
  if (!task || typeof task !== 'object' || Array.isArray(task)) {
    throw new Error('task must be an object');
  }
  if (typeof task.id !== 'string' || !/^[a-z0-9._-]{1,80}$/.test(task.id)) {
    throw new Error('invalid task id');
  }
  if (typeof task.operation !== 'string') {
    throw new Error('operation is required');
  }
  if (!ALLOWED_OPERATIONS.has(task.operation)) {
    throw new Error('operation not allowed');
  }

  return Object.freeze({
    id: task.id,
    operation: task.operation
  });
}
