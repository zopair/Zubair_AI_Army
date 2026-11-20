import { timingSafeEqual } from 'node:crypto';

export function paymentConfirmSecretMatches(configuredSecret, suppliedSecret) {
  if (typeof configuredSecret !== 'string' || !configuredSecret ||
      typeof suppliedSecret !== 'string' || !suppliedSecret) {
    return false;
  }

  const expected = Buffer.from(configuredSecret, 'utf8');
  const supplied = Buffer.from(suppliedSecret, 'utf8');
  if (expected.length !== supplied.length) return false;
  return timingSafeEqual(expected, supplied);
}
