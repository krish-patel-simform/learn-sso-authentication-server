import type { NextFunction, Request, Response } from 'express';
import type { ApiResponse, WithAuthRequest } from '../types/api/api.types.js';
import { getAuthUserFromAccessToken } from '../services/sessions/verifySession.service.js';

export async function authMiddleware(
  req: Request<unknown, null, WithAuthRequest>,
  res: Response<ApiResponse>,
  next: NextFunction,
) {
  try {
    // used an accessToken form the request that is not comign form the broswe
    const user = await getAuthUserFromAccessToken(req.body.accessToken);

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
