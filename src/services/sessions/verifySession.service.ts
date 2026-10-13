import { SessionModel } from '../../models/session.model.js';
import type { AuthUser } from '../../types/auth/auth.types.js';
import { verifyAccessToken } from '../jwt.service.js';

// why an access token can not be used:
//   missing         → no cookie / not a string
//   invalid         → bad signature, malformed, expired, or it is not an access token
//   session_invalid → the token is fine but its session was removed (logout), revoked or expired
export type AccessTokenFailure = 'missing' | 'invalid' | 'session_invalid';

export type AccessTokenCheck =
  { valid: true; user: AuthUser } | { valid: false; reason: AccessTokenFailure };

// check the access token AND its session, and tell the caller the reason when it fails.
// use the "valid" field to narrow it:  if (!check.valid) { check.reason ... } else { check.user ... }
export async function checkAccessToken(accessToken: unknown): Promise<AccessTokenCheck> {
  if (typeof accessToken !== 'string' || !accessToken) {
    return { valid: false, reason: 'missing' };
  }

  const decoded = verifyAccessToken(accessToken);
  if (!decoded) return { valid: false, reason: 'invalid' };

  // the token alone is not enough: the session must still exist (so logout really logs you out)
  const sessionExists = await SessionModel.exists({
    _id: decoded.sessionId,
    userId: decoded.userId,
    isRevoked: false,
    expireAt: { $gt: new Date() },
  });

  if (!sessionExists) return { valid: false, reason: 'session_invalid' };

  return { valid: true, user: { id: decoded.userId, sessionId: decoded.sessionId } };
}

// and /oauth/authorize (browser, redirect to the login page).
// returns null for ANY failure, use checkAccessToken when you need to know why
export async function getAuthUserFromAccessToken(accessToken: unknown): Promise<AuthUser | null> {
  const check = await checkAccessToken(accessToken);

  return check.valid ? check.user : null;
}
