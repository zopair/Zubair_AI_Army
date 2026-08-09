import assert from 'node:assert/strict';
import fs from 'node:fs';

const registry = JSON.parse(fs.readFileSync(new URL('../product-registry.json', import.meta.url)));
assert.equal(registry.count, 18, 'catalog must contain exactly 18 products');
assert.equal(registry.products.length, 18, 'registry must enumerate all products');
assert.equal(new Set(registry.products.map((p) => p.slug)).size, 18, 'duplicate product slug');
assert.ok(registry.products.some((p) => p.sellable), 'at least one product must be sellable');

const live = registry.products.filter((p) => p.sellable);
console.log(JSON.stringify({ gate: 'PASS', cataloged: 18, sellable: live.length, products: live.map((p) => p.slug) }));
