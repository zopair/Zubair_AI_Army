import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('V4 package manifest is valid and exposes production scripts', () => {
  const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
  assert.equal(manifest.scripts?.build, 'next build');
  assert.equal(manifest.scripts?.typecheck, 'tsc --noEmit');
  assert.ok(manifest.dependencies?.next);
  assert.ok(manifest.dependencies?.react);
});

test('V4 application has an App Router entry point and production configuration', () => {
  for (const path of ['src/app/layout.tsx', 'src/app/page.tsx', 'next.config.ts', 'tsconfig.json']) {
    assert.ok(existsSync(resolve(root, path)), `missing ${path}`);
  }
});
