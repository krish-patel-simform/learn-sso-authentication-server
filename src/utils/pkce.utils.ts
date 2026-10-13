import { createHash, timingSafeEqual } from 'node:crypto';

// the verifier must be 43-128 characters from this set (RFC 7636)
const CODE_VERIFIER_PATTERN = /^[A-Za-z0-9\-._~]{43,128}$/;

// PKCE: the app sent code_challenge = base64url(sha256(code_verifier)) to /authorize.
// now it sends the verifier to /token, we hash it again and the two must be equal.
// only the app that created the verifier can pass this, a stolen code alone is useless
export function verifyCodeChallenge(codeVerifier: string, codeChallenge: string) {
  if (!CODE_VERIFIER_PATTERN.test(codeVerifier)) return false;

  const expected = Buffer.from(codeChallenge);
  const actual = Buffer.from(createHash('sha256').update(codeVerifier).digest('base64url'));

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
