const RETRYABLE = new Set(['TIMEOUT', 'TEMPORARY_FAILURE', 'PROVIDER_UNAVAILABLE']);

export function nextAttempt({ attempt = 0, maxAttempts = 3, errorCode }) {
  if (!RETRYABLE.has(errorCode) || attempt >= maxAttempts - 1) return null;
  return { attempt: attempt + 1, backoffMs: 250 * 2 ** attempt };
}
