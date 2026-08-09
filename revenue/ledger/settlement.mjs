const REFERRAL_RATE = 0.10;
const HOLD_DAYS = 14;

export function recordRevenue({ requestId, customerId, agentId = null, productId, amount, variableCost = 0, units = 1 }) {
  if (!requestId || !customerId || !productId || amount <= 0) return { ok: false, reason: 'invalid-revenue-event' };
  if (variableCost < 0 || units < 1) return { ok: false, reason: 'invalid-cost-or-units' };
  const netRevenue = Number((amount - variableCost).toFixed(8));
  return { ok: true, event: { requestId, customerId, agentId, productId, units, grossRevenue: amount, variableCost, netRevenue, status: 'COLLECTED' } };
}

export function createPendingSettlement({ referral, revenueEvent, now = new Date() }) {
  if (!referral || !revenueEvent?.ok || revenueEvent.event.agentId !== referral.agentId) return { ok: false, reason: 'invalid-attribution' };
  if (revenueEvent.event.customerId !== referral.customerId || revenueEvent.event.productId !== referral.productId) return { ok: false, reason: 'mismatched-attribution' };
  const reward = Number((revenueEvent.event.netRevenue * REFERRAL_RATE).toFixed(8));
  if (reward <= 0) return { ok: false, reason: 'no-positive-net-revenue' };
  const releaseAt = new Date(now.getTime() + HOLD_DAYS * 86400000);
  return { ok: true, settlement: { referralId: referral.id, amount: reward, currency: 'USD', status: 'PENDING_HOLD', idempotencyKey: `reward:${referral.id}:${revenueEvent.event.requestId}`, releaseAt: releaseAt.toISOString() } };
}

export function releaseSettlement(settlement, { now = new Date(), refunded = false, chargeback = false } = {}) {
  if (!settlement?.ok) return { ok: false, reason: 'invalid-settlement' };
  if (refunded || chargeback) return { ok: false, reason: 'revenue-reversed' };
  if (now < new Date(settlement.settlement.releaseAt)) return { ok: false, reason: 'hold-active' };
  return { ok: true, status: 'READY_TO_SETTLE', idempotencyKey: settlement.settlement.idempotencyKey, amount: settlement.settlement.amount };
}
