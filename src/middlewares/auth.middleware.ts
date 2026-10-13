import type { NextFunction, Request, Response } from 'express';
import type { ApiResponse } from '../types/api/api.types.js';
import { getAuthUserFromAccessToken } from '../services/sessions/verifySession.service.js';
import { SSO_ACCESS_TOKEN_NAME } from '../constants/auth.constant.js';

export async function authMiddleware(req: Request, res: Response<ApiResponse>, next: NextFunction) {
  try {
    const user = await getAuthUserFromAccessToken(req.cookies?.[SSO_ACCESS_TOKEN_NAME]);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log('[auth middleware] error :', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
}
