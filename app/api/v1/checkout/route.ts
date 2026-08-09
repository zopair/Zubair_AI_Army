import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const MERCHANT_UID = '717654739';
const PRODUCT_ID = 'json-cleaner';
const ACTIVATION_AMOUNT = 0.25;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const customerId = typeof body?.customerId === 'string' ? body.customerId.trim() : '';
    const productId = body?.productId;
    const amount = Number(body?.amount);
    if (!customerId || productId !== PRODUCT_ID || amount !== ACTIVATION_AMOUNT) {
      return NextResponse.json({ error: 'invalid checkout request' }, { status: 400 });
    }

    const intent = await prisma.paymentIntent.create({
      data: { productId, customerId, amount, merchantUid: MERCHANT_UID, provider: 'binance_pay' }
    });

    return NextResponse.json({ id: intent.id, amount, currency: 'USD', provider: 'binance_pay', merchantUid: MERCHANT_UID, status: intent.status });
  } catch {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
