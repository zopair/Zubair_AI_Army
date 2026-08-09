import assert from 'node:assert/strict';
import fs from 'node:fs';

const campaign = fs.readFileSync(new URL('./campaign.yml', import.meta.url), 'utf8');
const roles = fs.readFileSync(new URL('./agent_roles.yml', import.meta.url), 'utf8');
const copy = fs.readFileSync(new URL('./copy.md', import.meta.url), 'utf8');

for (const required of ['no_spam', 'evidence_based_claims', 'no_fake_social_proof']) assert.ok(campaign.includes(required));
for (const required of ['do_not_mass_message', 'do_not_impersonate', 'do_not_fabricate_reviews']) assert.ok(roles.includes(required));
assert.ok(copy.includes('Products are now available for testing.'));
console.log('prelaunch campaign guardrails passed');
