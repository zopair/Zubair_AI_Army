import assert from 'node:assert/strict';
import fs from 'node:fs';

const registry = JSON.parse(fs.readFileSync(new URL('./product-registry.json', import.meta.url)));
assert.equal(registry.count, 18);
assert.equal(registry.products.length, 18);
const slugs = registry.products.map((p) => p.slug);
assert.equal(new Set(slugs).size, 18);
assert.ok(registry.products.some((p) => p.sellable === true));
assert.ok(registry.products.every((p) => p.status));
console.log(`product registry passed: ${registry.products.length}/18`);
