import { randomBytes } from 'node:crypto';
import { AUTH_CODE_MAX_AGE_MS } from '../constants/auth.constant.js';
import { AuthCodeModel } from '../models/authCode.model.js';
import { hashToken } from '../utils/token.utils.js';

interface CreateAuthCodeInput {
  clientId: string;
  userId: string;
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
    redirectUri: input.redirectUri,
    codeChallenge: input.codeChallenge,
    expiresAt: new Date(Date.now() + AUTH_CODE_MAX_AGE_MS),
  });

  return code;
}
