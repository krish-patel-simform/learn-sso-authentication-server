import type { Request, Response } from 'express';
import type { ApiResponse } from '../../types/api/api.types.js';
import { removeSession } from '../../services/sessions/removeSession.service.js';
import { clearAuthCookies } from '../../utils/cookie.utils.js';

// authMiddleware runs first, so req.user is already verified here
export async function logout(req: Request, res: Response<ApiResponse>) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // deleting the session kills both the refresh token and the access token (middleware checks it)
    await removeSession(req.user.sessionId);

    clearAuthCookies(res);

    return res.status(200).json({
      success: true,
      message: 'User logged out',
    });
  } catch (error) {
    console.log('[logout controller] error : ', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
}
