/**
 * Compare an Authorization header with a configured bearer token.
 *
 * The loop always processes the longer byte length and accumulates differences
 * instead of returning on the first mismatched character. JavaScript runtimes
 * do not provide a formal constant-time guarantee, but this avoids the
 * unsupported Web Crypto timingSafeEqual call and early-exit string comparison.
 */
export function constantTimeBearerTokenMatches(header, configuredToken) {
  if (typeof header !== "string" || typeof configuredToken !== "string" || configuredToken.length === 0) {
    return false;
  }

  const supplied = new TextEncoder().encode(header);
  const expected = new TextEncoder().encode(`Bearer ${configuredToken}`);
  const length = Math.max(supplied.length, expected.length);
  let difference = supplied.length ^ expected.length;

  for (let index = 0; index < length; index += 1) {
    difference |= (supplied[index] ?? 0) ^ (expected[index] ?? 0);
  }

  return difference === 0;
}
