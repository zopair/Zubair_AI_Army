export function calculateReward({ netRevenueUsd, rewardRate = 0.10, capUsd = Infinity }) {
  if (!Number.isFinite(netRevenueUsd) || netRevenueUsd <= 0) return 0;
  if (!Number.isFinite(rewardRate) || rewardRate < 0 || rewardRate > 1) throw new Error('invalid reward rate');
  const reward = netRevenueUsd * rewardRate;
  return Math.min(reward, capUsd);
}

export function isEligible({ paid, refunded = false, chargeback = false, selfReferral = false, fraudFlag = false }) {
  return Boolean(paid && !refunded && !chargeback && !selfReferral && !fraudFlag);
}
