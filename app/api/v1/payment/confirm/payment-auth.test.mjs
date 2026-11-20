import { describe, expect, it } from 'vitest';
import { paymentConfirmSecretMatches } from './payment-auth.mjs';

describe('manual payment confirmation secret', () => {
  it('accepts an exact configured secret', () => {
    expect(paymentConfirmSecretMatches('a-long-random-secret-123456', 'a-long-random-secret-123456')).toBe(true);
  });

  it('rejects wrong, missing, and empty secrets', () => {
    expect(paymentConfirmSecretMatches('a-long-random-secret-123456', 'a-long-random-secret-123457')).toBe(false);
    expect(paymentConfirmSecretMatches('a-long-random-secret-123456', '')).toBe(false);
    expect(paymentConfirmSecretMatches('', 'anything')).toBe(false);
    expect(paymentConfirmSecretMatches(null, 'anything')).toBe(false);
  });

  it('rejects different-length values safely', () => {
    expect(paymentConfirmSecretMatches('long-secret-value', 'short')).toBe(false);
  });
});
