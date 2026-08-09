import { createHash, randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const SERVICE = 'document-normalize-v1';
const PRODUCT_ID = 'json-cleaner';
const UNIT_PRICE = Number(process.env.NORMALIZE_UNIT_PRICE_USD ?? '0.01');
const MAX_CHARS = Number(process.env.NORMALIZE_MAX_CHARS ?? '50000');

function keyHash(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function normalize(text: string) {
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map(line => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function POST(req: Request) {
  const requestId = randomUUID();
  const started = Date.now();
  const suppliedKey = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  const apiKey = suppliedKey ? await prisma.apiKey.findUnique({ where: { keyHash: keyHash(suppliedKey) } }) : null;

  if (!apiKey || apiKey.revokedAt || apiKey.productId !== PRODUCT_ID) {
    return NextResponse.json({ error: 'unauthorized', requestId }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (typeof body?.text !== 'string' || body.text.length === 0) {
      return NextResponse.json({ error: 'text is required', requestId }, { status: 400 });
    }
    if (body.text.length > MAX_CHARS) {
      return NextResponse.json({ error: 'document exceeds configured size limit', requestId }, { status: 413 });
    }

    const result = normalize(body.text);
    const units = Math.max(1, Math.ceil(result.length / 1000));
    const grossRevenue = Number((units * UNIT_PRICE).toFixed(8));
    const quality = result.length > 0 ? 1 : 0;

    await prisma.revenueEvent.create({
      data: {
        service: SERVICE,
        requestId,
        customerId: apiKey.customerId,
        productId: PRODUCT_ID,
        units,
        grossRevenue,
        variableCost: 0,
        netRevenue: grossRevenue,
        status: 'COMPLETED',
        metadata: JSON.stringify({ latencyMs: Date.now() - started, inputChars: body.text.length, quality }),
      },
    });

    return NextResponse.json({
      requestId,
      service: SERVICE,
      output: result,
      usage: { units, unitPriceUsd: UNIT_PRICE, grossRevenueUsd: grossRevenue },
      quality,
    }, { headers: { 'X-Zopair-Request-Id': requestId } });
  } catch {
    return NextResponse.json({ error: 'invalid request', requestId }, { status: 400 });
  }
}
