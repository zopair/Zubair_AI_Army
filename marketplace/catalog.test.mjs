import assert from 'node:assert/strict';
import fs from 'node:fs';

const text = fs.readFileSync(new URL('./catalog.yml', import.meta.url), 'utf8');
const slugs = [...text.matchAll(/^  - slug: (.+)$/gm)].map((m) => m[1].trim());
assert.ok(slugs.length >= 10, 'catalog should contain a meaningful initial assortment');
assert.equal(new Set(slugs).size, slugs.length, 'product slugs must be unique');
assert.ok(text.includes('document-normalize-api'), 'anchor product must be listed');
console.log(`catalog checks passed: ${slugs.length} products`);
