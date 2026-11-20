import { describe, expect, it } from 'vitest';
import {
  extractBearerToken,
  normalizeText,
  parseNormalizePayload,
  readBoundedText,
  recordUsageAtomically,
  InsufficientCreditsError,
  PayloadTooLargeError
} from './normalize-service.mjs';

describe('normalize service validation', () => {
  it('accepts only a strict bearer authorization header', () => {
    expect(extractBearerToken('Bearer api-key-123')).toBe('api-key-123');
    expect(extractBearerToken('api-key-123')).toBe('');
    expect(extractBearerToken('Bearer two words')).toBe('');
    expect(extractBearerToken(null)).toBe('');
  });

  it('rejects malformed and non-object JSON payloads', () => {
    expect(parseNormalizePayload('{', 50).status).toBe(400);
    expect(parseNormalizePayload('null', 50).status).toBe(400);
    expect(parseNormalizePayload('[]', 50).status).toBe(400);
  });

  it('rejects empty text and text over the configured character limit', () => {
    expect(parseNormalizePayload(JSON.stringify({ text: '   ' }), 50).status).toBe(400);
    expect(parseNormalizePayload(JSON.stringify({ text: '12345' }), 4).status).toBe(413);
  });

  it('normalizes line endings and repeated whitespace deterministically', () => {
    expect(normalizeText('  alpha   beta\r\n\r\n\r\n gamma  ')).toBe('alpha beta\n\ngamma');
  });

  it('rejects request bodies over the byte limit before parsing', async () => {
    const request = new Request('https://example.test/normalize', {
      method: 'POST',
      body: JSON.stringify({ text: 'x'.repeat(100) })
    });
    await expect(readBoundedText(request, 32)).rejects.toBeInstanceOf(PayloadTooLargeError);
  });
});

describe('atomic prepaid usage recording', () => {
  it('decrements one credit and writes the revenue event inside one transaction', async () => {
    const calls = [];
    const tx = {
      customerCredit: {
        updateMany: async (query) => {
          calls.push(['decrement', query]);
          return { count: 1 };
        },
        findUnique: async () => ({ unitsRemaining: 24 })
      },
      revenueEvent: {
        create: async ({ data }) => { calls.push(['event', data]); }
      }
    };
    const prisma = { $transaction: async (callback) => callback(tx) };

    const usage = await recordUsageAtomically(prisma, {
      apiKey: { customerId: 'customer-1' },
      requestId: 'request-1',
      inputChars: 12,
      latencyMs: 5,
      quality: 1
    });

    expect(usage).toEqual({ units: 1, remainingCredits: 24 });
    expect(calls.map(([name]) => name)).toEqual(['decrement', 'event']);
    expect(calls[1][1].requestId).toBe('request-1');
  });

  it('does not write a revenue event when no prepaid credit remains', async () => {
    let eventWrites = 0;
    const tx = {
      customerCredit: {
        updateMany: async () => ({ count: 0 }),
        findUnique: async () => ({ unitsRemaining: 0 })
      },
      revenueEvent: {
        create: async () => { eventWrites += 1; }
      }
    };
    const prisma = { $transaction: async (callback) => callback(tx) };

    await expect(recordUsageAtomically(prisma, {
      apiKey: { customerId: 'customer-1' },
      requestId: 'request-2',
      inputChars: 12,
      latencyMs: 5,
      quality: 1
    })).rejects.toBeInstanceOf(InsufficientCreditsError);

    expect(eventWrites).toBe(0);
  });
});
