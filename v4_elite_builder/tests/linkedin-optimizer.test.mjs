import test from "node:test";
import assert from "node:assert/strict";
import {
  validateLinkedInOptimizeRequest,
  buildLinkedInRecommendations
} from "../src/lib/linkedin-optimizer.mjs";

test("rejects malformed JSON and non-object payloads", () => {
  assert.deepEqual(validateLinkedInOptimizeRequest("{"), {
    ok: false,
    status: 400,
    error: "Invalid JSON request."
  });
  assert.equal(validateLinkedInOptimizeRequest("null").status, 400);
  assert.equal(validateLinkedInOptimizeRequest("[]").status, 400);
});

test("rejects missing, non-string, and blank profile fields", () => {
  assert.equal(validateLinkedInOptimizeRequest("{}").status, 400);
  assert.equal(validateLinkedInOptimizeRequest(JSON.stringify({
    headline: 7,
    summary: "Experience"
  })).status, 400);
  assert.equal(validateLinkedInOptimizeRequest(JSON.stringify({
    headline: "   ",
    summary: "Experience"
  })).status, 400);
});

test("enforces request and individual field size limits", () => {
  assert.equal(validateLinkedInOptimizeRequest(" ".repeat(9001)).status, 413);
  assert.equal(validateLinkedInOptimizeRequest(JSON.stringify({
    headline: "h".repeat(181),
    summary: "Experience"
  })).status, 413);
  assert.equal(validateLinkedInOptimizeRequest(JSON.stringify({
    headline: "Engineer",
    summary: "s".repeat(4001)
  })).status, 413);
});

test("normalizes whitespace and returns a validated profile", () => {
  const result = validateLinkedInOptimizeRequest(JSON.stringify({
    headline: "  Senior   Software Engineer ",
    summary: " Builds   products. Delivers   measurable outcomes. "
  }));
  assert.deepEqual(result, {
    ok: true,
    headline: "Senior Software Engineer",
    summary: "Builds products. Delivers measurable outcomes."
  });
});

test("builds transparent rule-based recommendations without claiming AI", () => {
  const result = buildLinkedInRecommendations({
    headline: "Senior Engineer",
    summary: "Builds products and leads teams."
  });
  assert.equal(result.mode, "rule-based-preview");
  assert.ok(result.recommendations.length > 0);
  assert.match(result.disclaimer, /ليست مخرجات نموذج ذكاء اصطناعي/);
});
