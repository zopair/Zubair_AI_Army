export class PayloadTooLargeError extends Error {}
export class InsufficientCreditsError extends Error {}

export function extractBearerToken(header: string | null): string;
export function readBoundedText(request: Request, maxBytes: number): Promise<string>;
export function parseNormalizePayload(
  rawBody: string,
  maxChars: number
):
  | { ok: true; text: string }
  | { ok: false; status: number; error: string };
export function normalizeText(text: string): string;

type CreditTransaction = {
  customerCredit: {
    updateMany(args: {
      where: {
        customerId: string;
        productId: string;
        unitsRemaining: { gt: number };
      };
      data: { unitsRemaining: { decrement: number } };
    }): Promise<{ count: number }>;
    findUnique(args: {
      where: { customerId_productId: { customerId: string; productId: string } };
    }): Promise<{ unitsRemaining: number } | null>;
  };
  revenueEvent: {
    create(args: { data: Record<string, unknown> }): Promise<unknown>;
  };
};

export function recordUsageAtomically(
  prisma: {
    $transaction<T>(callback: (tx: CreditTransaction) => Promise<T>): Promise<T>;
  },
  args: {
    apiKey: { customerId: string };
    requestId: string;
    inputChars: number;
    latencyMs: number;
    quality: number;
  }
): Promise<{ units: number; remainingCredits: number }>;
