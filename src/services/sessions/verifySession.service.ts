import { SessionModel } from '../../models/session.model.js';
import type { AuthUser } from '../../types/auth/auth.types.js';
import { verifyAccessToken } from '../jwt.service.js';

// the "is this user logged in to the auth server?" check, shared by authMiddleware (api, json 401)
// and /oauth/authorize (browser, redirect to the login page).
// returns null when the cookie is missing, invalid, expired or the session was removed
export async function getAuthUserFromAccessToken(accessToken: unknown): Promise<AuthUser | null> {
  if (typeof accessToken !== 'string') return null;

  const decoded = verifyAccessToken(accessToken);
  if (!decoded) return null;

  // the token alone is not enough: the session must still exist (so logout really logs you out)
  const sessionExists = await SessionModel.exists({
    _id: decoded.sessionId,
    userId: decoded.userId,
    isRevoked: false,
    expireAt: { $gt: new Date() },
  });

  if (!sessionExists) return null;

  return { id: decoded.userId, sessionId: decoded.sessionId };
}
