import { randomBytes } from 'node:crypto';
import { AUTH_CODE_MAX_AGE_MS } from '../constants/auth.constant.js';
import { AuthCodeModel } from '../models/authCode.model.js';
import { hashToken } from '../utils/token.utils.js';

interface CreateAuthCodeInput {
  clientId: string;
  userId: string;
  ssoSessionId: string;
  redirectUri: string;
  codeChallenge: string;
}

// returns the PLAIN code (sent to the app in the redirect), only its hash is saved
export async function createAuthCode(input: CreateAuthCodeInput) {
  const code = randomBytes(32).toString('base64url');

  await AuthCodeModel.create({
    hashedCode: hashToken(code),
    clientId: input.clientId,
    userId: input.userId,
    ssoSessionId: input.ssoSessionId,
    redirectUri: input.redirectUri,
    codeChallenge: input.codeChallenge,
    expiresAt: new Date(Date.now() + AUTH_CODE_MAX_AGE_MS),
  });

  return code;
}

// find the code AND mark it used in ONE query, so two requests with the same code can never both win.
// the code is hashed with hashToken (sha256) exactly like in createAuthCode: the same input gives the
// same hash, a bcrypt hash would be different every time and never match.
// the expiry is checked here too, because mongo's TTL index can delete an expired code up to ~1 min late.
// returns the code as it was BEFORE the update (null if missing, expired or already used)
export function consumeAuthCode(code: string) {
  return AuthCodeModel.findOneAndUpdate(
    { hashedCode: hashToken(code), isUsed: false, expiresAt: { $gt: new Date() } },
    { $set: { isUsed: true } },
  );
}
