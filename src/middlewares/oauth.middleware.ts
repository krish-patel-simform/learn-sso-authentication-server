import type { NextFunction, Request, Response } from 'express';
import type { ApiResponse } from '../types/api/api.types.js';
import { SSO_ACCESS_TOKEN_NAME, SSO_REFRESH_TOKEN_NAME } from '../constants/auth.constant.js';
import { verifyAccessToken, verifyRefreshToken } from '../services/jwt.service.js';
import { SessionModel } from '../models/session.model.js';
import { hashToken } from '../utils/token.utils.js';

// finds the SSO session of the BROWSER (the sso_* cookies) and puts its id on req.ssoSessionId.
// it never rejects: when there is no usable session the user is already logged out here,
// so the controller still finishes the logout (clear cookies + redirect back) instead of showing json
export async function oauthMiddleware(
  req: Request,
  _res: Response<ApiResponse>,
  next: NextFunction,
) {
  try {
    const accessToken = req.cookies?.[SSO_ACCESS_TOKEN_NAME];
    const refreshToken = req.cookies?.[SSO_REFRESH_TOKEN_NAME];

    // the access token expires after 15 minutes, but logout must still work after that
    const accessDecoded = typeof accessToken === 'string' ? verifyAccessToken(accessToken) : null;

    if (accessDecoded) {
      req.ssoSessionId = accessDecoded.sessionId;
      return next();
    }

    // fallback: the refresh token has no session id, so find the session by the hash of the token
    const refreshDecoded =
      typeof refreshToken === 'string' ? verifyRefreshToken(refreshToken) : null;

    if (refreshDecoded && typeof refreshToken === 'string') {
      const session = await SessionModel.findOne({
        userId: refreshDecoded.userID,
        hashedRefreshToken: hashToken(refreshToken),
      }).select('_id');

      req.ssoSessionId = session?._id.toString();
    }

    next();
  } catch (error) {
    console.log('[oauth middleware] error :', error);
    next();
  }
}
