const ALLOWED = new Set(['json', 'txt', 'log', 'zip']);

export function validateArtifact({ name, type, sizeBytes = 0 }) {
  if (!name || name.includes('..') || name.startsWith('/')) throw new Error('invalid artifact name');
  if (!ALLOWED.has(type)) throw new Error(`artifact type not allowed: ${type}`);
  if (!Number.isSafeInteger(sizeBytes) || sizeBytes < 0 || sizeBytes > 10 * 1024 * 1024) throw new Error('artifact size exceeds policy');
  return Object.freeze({ name, type, sizeBytes });
}
