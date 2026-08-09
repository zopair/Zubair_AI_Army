const clamp = (n) => Math.max(0, Math.min(100, n));

export function scoreLead({ fit = 0, intent = 0, engagement = 0, budgetSignal = 0 }) {
  const score = 0.35 * fit + 0.35 * intent + 0.20 * engagement + 0.10 * budgetSignal;
  return {
    score: clamp(score),
    tier: score >= 75 ? 'high' : score >= 50 ? 'medium' : 'low',
  };
}
