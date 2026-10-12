import { SessionModel } from '../../models/session.model.js';
import { REFRESH_TOKEN_MAX_AGE_MS } from '../../constants/auth.constant.js';
import { createAccessToken, createRefreshToken } from '../jwt.service.js';
import { hashToken } from '../../utils/token.utils.js';

// one place that creates a session + both tokens (used by register and login)
export async function createSession(userId: string) {
  const refreshToken = createRefreshToken({ userID: userId });

  const session = await SessionModel.create({
    userId,
    hashedRefreshToken: hashToken(refreshToken),
    expireAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS),
  });

  const accessToken = createAccessToken({ userId, sessionId: session._id.toString() });

  return { accessToken, refreshToken };
}
