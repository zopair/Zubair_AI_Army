export function meterUsage({ productId, customerId, units, unitPriceUsd }) {
  if (!productId || !customerId) throw new Error('productId and customerId are required');
  if (!Number.isFinite(units) || units <= 0) throw new Error('units must be positive');
  if (!Number.isFinite(unitPriceUsd) || unitPriceUsd < 0) throw new Error('unitPriceUsd must be non-negative');
  return { productId, customerId, units, unitPriceUsd, amountUsd: Number((units * unitPriceUsd).toFixed(8)) };
}
