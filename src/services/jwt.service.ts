import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import type { AccessTokenPayload, RefreshTokenPaylaod } from '../types/auth/jwt.types.js';
import { env } from '../config/env.js';
import { ACCESS_TOKEN_MAX_AGE_MS, REFRESH_TOKEN_MAX_AGE_MS } from '../constants/auth.constant.js';

const ALGORITHM = 'HS256';

// jti makes every token unique, so two refresh tokens never hash to the same value
export function createAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: ALGORITHM,
    expiresIn: ACCESS_TOKEN_MAX_AGE_MS / 1000,
    jwtid: randomUUID(),
  });
}

export function createRefreshToken(payload: RefreshTokenPaylaod) {
  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: ALGORITHM,
    expiresIn: REFRESH_TOKEN_MAX_AGE_MS / 1000,
    jwtid: randomUUID(),
  });
}

// returns null for a bad / expired token instead of throwing
function verifyToken(token: string): jwt.JwtPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: [ALGORITHM] });
    return typeof decoded === 'object' ? decoded : null;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) return null;
    throw error;
  }
}

// the field checks stop a refresh token being used as an access token (and the other way round)
export function verifyAccessToken(accessToken: string): AccessTokenPayload | null {
  const decoded = verifyToken(accessToken);
  if (!decoded?.userId || !decoded.sessionId) return null;
  return decoded as AccessTokenPayload;
}

export function verifyRefreshToken(refreshToken: string): RefreshTokenPaylaod | null {
  const decoded = verifyToken(refreshToken);
  if (!decoded?.userID || decoded.sessionId) return null;
  return decoded as RefreshTokenPaylaod;
}
