export function scoreOpportunity({ demand, buildEase, competition, monetization }) {
  const clamp = (v) => Math.max(0, Math.min(100, Number(v) || 0));
  const d = clamp(demand), e = clamp(buildEase), c = clamp(competition), m = clamp(monetization);
  return Math.round(d * 0.35 + e * 0.25 + (100 - c) * 0.20 + m * 0.20);
}

export function decision(score) {
  if (score >= 75) return 'BUILD';
  if (score >= 55) return 'VALIDATE';
  return 'BACKLOG';
}
