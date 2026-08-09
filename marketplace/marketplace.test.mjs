import assert from 'node:assert/strict';
import fs from 'node:fs';
const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');
assert.ok(html.includes('ZOPAIR MARKET'));
assert.ok(html.includes('document-normalize-api'));
assert.ok(html.includes('Search products'));
assert.ok(html.includes('prototype'));
console.log('marketplace smoke checks passed');
