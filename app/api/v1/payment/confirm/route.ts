import { createHash, randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const MERCHANT_UID = '717654739';

function hash(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

export async function POST(req: Request) {
  const configuredSecret = process.env.PAYMENT_CONFIRM_SECRET;
  const suppliedSecret = req.headers.get('x-payment-confirm-secret') ?? '';
  if (!configuredSecret || suppliedSecret !== configuredSecret) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const intentId = typeof body?.intentId === 'string' ? body.intentId : '';
    const externalRef = typeof body?.externalRef === 'string' ? body.externalRef.trim() : '';
    if (!intentId || !externalRef) return NextResponse.json({ error: 'intentId and externalRef are required' }, { status: 400 });

    const intent = await prisma.paymentIntent.findUnique({ where: { id: intentId } });
    if (!intent || intent.merchantUid !== MERCHANT_UID) return NextResponse.json({ error: 'payment intent not found' }, { status: 404 });
    if (intent.status === 'CONFIRMED') return NextResponse.json({ error: 'payment intent already confirmed' }, { status: 409 });

    const duplicate = await prisma.paymentIntent.findUnique({ where: { externalRef } });
    if (duplicate) return NextResponse.json({ error: 'external payment reference already used' }, { status: 409 });

    const plaintextKey = `zop_${randomBytes(24).toString('base64url')}`;
    const requestId = `payment_${intent.id}`;
    const now = new Date();

    await prisma.$transaction(async tx => {
      await tx.paymentIntent.update({ where: { id: intent.id }, data: { status: 'CONFIRMED', externalRef, confirmedAt: now } });
      await tx.revenueEvent.create({
        data: {
          service: 'binance-pay-receive', requestId, customerId: intent.customerId, productId: intent.productId,
          units: 1, grossRevenue: intent.amount, variableCost: 0, netRevenue: intent.amount,
          status: 'CONFIRMED', metadata: JSON.stringify({ provider: 'binance_pay', merchantUid: MERCHANT_UID, externalRef })
        }
      });
      await tx.apiKey.create({ data: { customerId: intent.customerId, productId: intent.productId, keyHash: hash(plaintextKey) } });
    });

    return NextResponse.json({ status: 'CONFIRMED', customerId: intent.customerId, productId: intent.productId, apiKey: plaintextKey, note: 'Store this API key securely; it is returned once.' });
  } catch {
    return NextResponse.json({ error: 'unable to confirm payment' }, { status: 400 });
  }
}
