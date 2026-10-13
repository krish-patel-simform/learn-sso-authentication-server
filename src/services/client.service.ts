import { randomBytes, timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';
import { ClientModel } from '../models/client.model.js';
import { hashToken } from '../utils/token.utils.js';

export function generateClientCredentials() {
  const clientId = randomBytes(16).toString('hex');
  // 256 bits of randomness, so a fast sha256 hash is enough (same reason as the refresh token)
  const clientSecret = randomBytes(32).toString('base64url');

  return { clientId, clientSecret, clientSecretHash: hashToken(clientSecret) };
}

// returns the cleaned list, or null when any uri is not allowed
export function parseRedirectUris(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;

  const uris: string[] = [];

  for (const item of value) {
    if (typeof item !== 'string') return null;

    let url: URL;
    try {
      url = new URL(item.trim());
    } catch {
      return null;
    }

    // plain http is only fine while developing; fragments are not allowed in a redirect uri
    const protocolAllowed =
      url.protocol === 'https:' || (url.protocol === 'http:' && env.NODE_ENV !== 'production');
    if (!protocolAllowed || url.hash) return null;

    uris.push(item.trim());
  }

  return [...new Set(uris)];
}

// step 1 of "is this a valid client": does this client_id exist
export function findClient(clientId: unknown) {
  if (typeof clientId !== 'string' || !clientId) return null;
  return ClientModel.findOne({ clientId });
}

// step 2: the redirect uri must match one registered uri EXACTLY (no prefix / wildcard matching),
// otherwise an attacker could get the login code sent to their own site
export function isRedirectUriAllowed(client: { redirectUris: string[] }, redirectUri: unknown) {
  return typeof redirectUri === 'string' && client.redirectUris.includes(redirectUri);
}

// for logout: the user may only be sent back to a SITE of this client, so the origin (scheme + host + port)
// of the url must be the origin of one of the registered redirect uris. any path on that site is fine
export function isRedirectOriginAllowed(client: { redirectUris: string[] }, redirectTo: unknown) {
  if (typeof redirectTo !== 'string') return false;

  try {
    const { origin } = new URL(redirectTo);

    // 'null' is the origin of non http(s) urls like javascript: or data:
    return origin !== 'null' && client.redirectUris.some((uri) => new URL(uri).origin === origin);
  } catch {
    return false;
  }
}

// step 3 (only on /token, server to server): the app proves it is the real app with its secret
export async function verifyClientSecret(clientId: string, clientSecret: unknown) {
  if (typeof clientSecret !== 'string' || !clientSecret) return false;

  const client = await ClientModel.findOne({ clientId }).select('+clientSecretHash');
  if (!client) return false;

  const expected = Buffer.from(client.clientSecretHash, 'hex');
  const actual = Buffer.from(hashToken(clientSecret), 'hex');

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
