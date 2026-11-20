import { createHash, randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  extractBearerToken,
  InsufficientCreditsError,
  normalizeText,
  parseNormalizePayload,
  PayloadTooLargeError,
  readBoundedText,
  recordUsageAtomically
} from './normalize-service.mjs';

const PRODUCT_ID = 'json-cleaner';

function keyHash(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function configuredMaxChars() {
  const configured = Number(process.env.NORMALIZE_MAX_CHARS ?? '50000');
  return Number.isSafeInteger(configured) && configured > 0
    ? Math.min(configured, 100000)
    : 50000;
}

export async function POST(req: Request) {
  const requestId = randomUUID();
  const started = Date.now();

  try {
    const suppliedKey = extractBearerToken(req.headers.get('authorization'));
    if (!suppliedKey) {
      return NextResponse.json({ error: 'unauthorized', requestId }, { status: 401 });
    }

    const apiKey = await prisma.apiKey.findUnique({
      where: { keyHash: keyHash(suppliedKey) }
    });
    if (!apiKey || apiKey.revokedAt || apiKey.productId !== PRODUCT_ID) {
      return NextResponse.json({ error: 'unauthorized', requestId }, { status: 401 });
    }

    const maxChars = configuredMaxChars();
    const rawBody = await readBoundedText(req, Math.min(maxChars * 4 + 4096, 256000));
    const payload = parseNormalizePayload(rawBody, maxChars);
    if (!payload.ok) {
      return NextResponse.json(
        { error: payload.error, requestId },
        { status: payload.status }
      );
    }

    const result = normalizeText(payload.text);
    const quality = result.length > 0 ? 1 : 0;
    const usage = await recordUsageAtomically(prisma, {
      apiKey,
      requestId,
      inputChars: payload.text.length,
      latencyMs: Date.now() - started,
      quality
    });

    return NextResponse.json({
      requestId,
      service: 'document-normalize-v1',
      output: result,
      usage,
      quality
    }, {
      headers: { 'X-Zopair-Request-Id': requestId }
    });
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return NextResponse.json({ error: 'request body too large', requestId }, { status: 413 });
    }
    if (error instanceof InsufficientCreditsError) {
      return NextResponse.json({ error: 'no prepaid credits remaining', requestId }, { status: 402 });
    }
    return NextResponse.json({ error: 'normalization service unavailable', requestId }, { status: 500 });
  }
}
