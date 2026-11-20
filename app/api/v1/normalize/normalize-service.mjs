export class PayloadTooLargeError extends Error {
  constructor() {
    super('request body exceeds the configured size limit');
    this.name = 'PayloadTooLargeError';
  }
}

export class InsufficientCreditsError extends Error {
  constructor() {
    super('no prepaid credits remaining');
    this.name = 'InsufficientCreditsError';
  }
}

export function extractBearerToken(header) {
  if (typeof header !== 'string') return '';
  const match = header.match(/^Bearer ([A-Za-z0-9._~-]{16,256})$/i);
  return match ? match[1] : '';
}

export async function readBoundedText(request, maxBytes) {
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new PayloadTooLargeError();
  }
  if (!request.body) return '';

  const reader = request.body.getReader();
  const chunks = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        throw new PayloadTooLargeError();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}

export function parseNormalizePayload(rawBody, maxChars) {
  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return { ok: false, status: 400, error: 'invalid JSON request' };
  }

  if (!body || typeof body !== 'object' || Array.isArray(body) ||
      typeof body.text !== 'string' || !body.text.trim()) {
    return { ok: false, status: 400, error: 'text is required' };
  }

  if (body.text.length > maxChars) {
    return { ok: false, status: 413, error: 'document exceeds configured size limit' };
  }

  return { ok: true, text: body.text };
}

export function normalizeText(text) {
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function recordUsageAtomically(prisma, {
  apiKey,
  requestId,
  inputChars,
  latencyMs,
  quality
}) {
  return prisma.$transaction(async (tx) => {
    const consumed = await tx.customerCredit.updateMany({
      where: {
        customerId: apiKey.customerId,
        productId: 'json-cleaner',
        unitsRemaining: { gt: 0 }
      },
      data: { unitsRemaining: { decrement: 1 } }
    });

    if (consumed.count !== 1) throw new InsufficientCreditsError();

    await tx.revenueEvent.create({
      data: {
        service: 'document-normalize-v1',
        requestId,
        customerId: apiKey.customerId,
        productId: 'json-cleaner',
        units: 1,
        grossRevenue: 0,
        variableCost: 0,
        netRevenue: 0,
        status: 'USAGE_RECORDED',
        metadata: JSON.stringify({
          latencyMs,
          inputChars,
          quality,
          billing: 'prepaid'
        })
      }
    });

    const credit = await tx.customerCredit.findUnique({
      where: {
        customerId_productId: {
          customerId: apiKey.customerId,
          productId: 'json-cleaner'
        }
      }
    });

    return { units: 1, remainingCredits: credit?.unitsRemaining ?? 0 };
  });
}
