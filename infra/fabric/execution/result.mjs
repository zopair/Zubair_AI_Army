export function successResult(task, output = {}) {
  return Object.freeze({
    id: task.id,
    status: 'succeeded',
    exitCode: output.exitCode ?? 0,
    stdout: output.stdout ?? '',
    stderr: output.stderr ?? '',
    provider: output.provider ?? 'unknown',
    attempts: output.attempts ?? 1,
  });
}

export function failureResult(task, error, output = {}) {
  return Object.freeze({
    id: task.id,
    status: 'failed',
    error: { code: error.code ?? 'EXECUTION_FAILED', message: error.message ?? String(error) },
    exitCode: output.exitCode ?? null,
    stdout: output.stdout ?? '',
    stderr: output.stderr ?? '',
    provider: output.provider ?? 'unknown',
    attempts: output.attempts ?? 1,
  });
}
