export function opportunityScore({ demand, competition, buildEffort, willingnessToPay }) {
  const values = [demand, competition, buildEffort, willingnessToPay];
  if (values.some(v => !Number.isFinite(v) || v < 0 || v > 100)) throw new Error('scores must be 0..100');
  return Number((0.35*demand + 0.20*(100-competition) + 0.20*(100-buildEffort) + 0.25*willingnessToPay).toFixed(2));
}
