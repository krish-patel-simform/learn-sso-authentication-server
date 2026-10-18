import { SessionModel } from '../../models/session.model.js';
import { REFRESH_TOKEN_MAX_AGE_MS } from '../../constants/auth.constant.js';
import { createAccessToken, createRefreshToken } from '../jwt.service.js';
import { hashToken } from '../../utils/token.utils.js';

interface CreateSessionOptions {
  // set by /token: the SSO login this app session belongs to
  parentSessionId?: string;
  // an app session must not outlive its SSO login, so /token passes the parent's expiry
  expireAt?: Date;
}

// one place that creates a session + both tokens (used by register, login and /token)
export async function createSession(userId: string, options: CreateSessionOptions = {}) {
  const refreshToken = createRefreshToken({ userID: userId });

  const session = await SessionModel.create({
    userId,
    hashedRefreshToken: hashToken(refreshToken),
    expireAt: options.expireAt ?? new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS),
    parentSessionId: options.parentSessionId ?? null,
  });

  const accessToken = createAccessToken({ userId, sessionId: session._id.toString() });

  return { accessToken, refreshToken };
}
