import test from "node:test";
import assert from "node:assert/strict";
import { constantTimeBearerTokenMatches } from "./auth.js";

test("accepts the exact configured bearer token", () => {
  assert.equal(constantTimeBearerTokenMatches("Bearer correct-secret", "correct-secret"), true);
});

test("rejects a wrong bearer token", () => {
  assert.equal(constantTimeBearerTokenMatches("Bearer wrong-secret", "correct-secret"), false);
});

test("rejects missing, malformed, and empty configured tokens", () => {
  assert.equal(constantTimeBearerTokenMatches(null, "correct-secret"), false);
  assert.equal(constantTimeBearerTokenMatches("correct-secret", "correct-secret"), false);
  assert.equal(constantTimeBearerTokenMatches("Bearer ", ""), false);
  assert.equal(constantTimeBearerTokenMatches("Bearer anything", ""), false);
});

test("rejects tokens with different lengths", () => {
  assert.equal(constantTimeBearerTokenMatches("Bearer short", "a-much-longer-secret"), false);
});
