import type { NextFunction, Request, Response } from 'express';
import type { ApiResponse } from '../types/api/api.types.js';
import { verifyAccessToken } from '../services/jwt.service.js';
import { SessionModel } from '../models/session.model.js';

export async function authMiddleware(req: Request, res: Response<ApiResponse>, next: NextFunction) {
  try {
    const accessToken = req.cookies?.accessToken;

    if (typeof accessToken !== 'string') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // the token alone is not enough: the session must still exist (so logout really logs you out)
    const sessionExists = await SessionModel.exists({
      _id: decoded.sessionId,
      userId: decoded.userId,
      isRevoked: false,
      expireAt: { $gt: new Date() },
    });

    if (!sessionExists) {
      return res.status(401).json({
        success: false,
        message: 'Session is no longer valid',
      });
    }

    req.user = {
      id: decoded.userId,
      sessionId: decoded.sessionId,
    };

    next();
  } catch (error) {
    console.log('[auth middleware] error :', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
}
