export function createReferral({ agentId, productId, now = new Date() }) {
  if (!agentId || !productId) throw new Error('agentId and productId are required');
  const id = `ref_${agentId}_${productId}_${now.getTime()}`;
  return { id, agentId, productId, createdAt: now.toISOString(), expiresAt: new Date(now.getTime() + 30 * 86400000).toISOString() };
}

export function attributePurchase({ referral, customerId, amount, now = new Date(), refunded = false, chargeback = false }) {
  if (!referral || !customerId) return { eligible: false, reason: 'missing-attribution-data' };
  if (referral.customerId && referral.customerId === customerId) return { eligible: false, reason: 'duplicate-customer' };
  if (now > new Date(referral.expiresAt)) return { eligible: false, reason: 'expired' };
  if (refunded || chargeback || amount <= 0) return { eligible: false, reason: 'non-qualifying-revenue' };
  const reward = Number((amount * 0.10).toFixed(8));
  return { eligible: true, reward, currency: 'USD', basis: 'verified-net-collected-revenue' };
}
