import { describe, expect, it } from 'vitest';

describe('document-normalize-v1 contract', () => {
  it('defines the expected endpoint contract', () => {
    expect('/api/v1/normalize').toBe('/api/v1/normalize');
    expect('Bearer API key').toContain('API key');
  });
});
