const required = [
  'product_published',
  'visitor',
  'lead',
  'order',
  'payment_verified',
  'entitlement',
  'delivery',
  'revenue_ledger',
  'analytics_event',
  'recovery'
];

export function evaluate(events) {
  const seen = new Set(events.map(e => e.type));
  const missing = required.filter(type => !seen.has(type));
  return Object.freeze({ passed: missing.length === 0, missing });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const demo = required.map(type => ({ type }));
  const result = evaluate(demo);
  if (!result.passed) process.exit(1);
  console.log('revenue closure gate passed');
}
