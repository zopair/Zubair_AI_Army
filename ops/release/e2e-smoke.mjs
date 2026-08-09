import assert from 'node:assert/strict';

const required = ['product_id','event_id','timestamp','status'];
const events = [
  { event_id:'e1', product_id:'demo', timestamp:new Date().toISOString(), status:'view' },
  { event_id:'e2', product_id:'demo', timestamp:new Date().toISOString(), status:'lead' },
  { event_id:'e3', product_id:'demo', timestamp:new Date().toISOString(), status:'order' },
  { event_id:'e4', product_id:'demo', timestamp:new Date().toISOString(), status:'payment_verified' },
  { event_id:'e5', product_id:'demo', timestamp:new Date().toISOString(), status:'delivered' }
];
for (const event of events) for (const key of required) assert.ok(event[key], `${event.status}: missing ${key}`);
const allowed = new Set(['view','lead','order','payment_verified','delivered','referral']);
for (const event of events) assert.ok(allowed.has(event.status));
assert.equal(events.at(-2).status, 'payment_verified');
assert.equal(events.at(-1).status, 'delivered');
console.log('revenue lifecycle smoke contract passed');
