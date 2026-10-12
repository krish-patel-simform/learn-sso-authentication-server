import type { Request, Response } from 'express';
import type { ApiResponse } from '../../types/api/api.types.js';
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from '../../services/jwt.service.js';
import { SessionModel } from '../../models/session.model.js';
import { REFRESH_TOKEN_MAX_AGE_MS } from '../../constants/auth.constant.js';
import { hashToken } from '../../utils/token.utils.js';
import { clearAuthCookies, setAuthCookies } from '../../utils/cookie.utils.js';

export async function refreshTokens(req: Request, res: Response<ApiResponse>) {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (typeof refreshToken !== 'string') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized for the access',
      });
    }

    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }

    // same token -> same sha256 hash, so we can find its session directly
    const session = await SessionModel.findOne({
      hashedRefreshToken: hashToken(refreshToken),
      isRevoked: false,
      expireAt: { $gt: new Date() },
    });

    // never create a session here: no session means the user was logged out (or token was already rotated)
    if (!session) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: 'Session not found, please login again',
      });
    }

    // rotation: every refresh gives a new refresh token and the old one stops working
    const newRefreshToken = createRefreshToken({ userID: decoded.userID });
    session.hashedRefreshToken = hashToken(newRefreshToken);
    session.expireAt = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);
    await session.save();

    const accessToken = createAccessToken({
      userId: decoded.userID,
      sessionId: session._id.toString(),
    });

    setAuthCookies(res, { accessToken, refreshToken: newRefreshToken });

    return res.status(200).json({
      success: true,
      message: 'Tokens refreshed',
    });
  } catch (error) {
    console.log('[refresh tokens controller] error : ', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
}
