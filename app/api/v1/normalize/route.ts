import { createHash, randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const SERVICE = 'document-normalize-v1';
const PRODUCT_ID = 'json-cleaner';
const MAX_CHARS = Number(process.env.NORMALIZE_MAX_CHARS ?? '50000');

function keyHash(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function normalize(text: string) {
  return text.replace(/\r\n?/g, '\n').split('\n').map(line => line.replace(/[ \t]+/g, ' ').trim()).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export async function POST(req: Request) {
  const requestId = randomUUID();
  const started = Date.now();
  const suppliedKey = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  const apiKey = suppliedKey ? await prisma.apiKey.findUnique({ where: { keyHash: keyHash(suppliedKey) } }) : null;
  if (!apiKey || apiKey.revokedAt || apiKey.productId !== PRODUCT_ID) return NextResponse.json({ error: 'unauthorized', requestId }, { status: 401 });

  try {
    const body = await req.json();
    if (typeof body?.text !== 'string' || body.text.length === 0) return NextResponse.json({ error: 'text is required', requestId }, { status: 400 });
    if (body.text.length > MAX_CHARS) return NextResponse.json({ error: 'document exceeds configured size limit', requestId }, { status: 413 });

    const result = normalize(body.text);
    const usageUnits = 1;
    const quality = result.length > 0 ? 1 : 0;

    const consumed = await prisma.customerCredit.updateMany({
      where: { customerId: apiKey.customerId, productId: PRODUCT_ID, unitsRemaining: { gt: 0 } },
      data: { unitsRemaining: { decrement: usageUnits } }
    });
    if (consumed.count !== 1) return NextResponse.json({ error: 'no prepaid credits remaining', requestId }, { status: 402 });

    await prisma.revenueEvent.create({
      data: {
        service: SERVICE,
        requestId,
        customerId: apiKey.customerId,
        productId: PRODUCT_ID,
        units: usageUnits,
        grossRevenue: 0,
        variableCost: 0,
        netRevenue: 0,
        status: 'USAGE_RECORDED',
        metadata: JSON.stringify({ latencyMs: Date.now() - started, inputChars: body.text.length, quality, billing: 'prepaid' })
      }
    });

    const credit = await prisma.customerCredit.findUnique({ where: { customerId_productId: { customerId: apiKey.customerId, productId: PRODUCT_ID } } });
    return NextResponse.json({ requestId, service: SERVICE, output: result, usage: { units: usageUnits, remainingCredits: credit?.unitsRemaining ?? 0 }, quality }, { headers: { 'X-Zopair-Request-Id': requestId } });
  } catch {
    return NextResponse.json({ error: 'invalid request', requestId }, { status: 400 });
  }
}
