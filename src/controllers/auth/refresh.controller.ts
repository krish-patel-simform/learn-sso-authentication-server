import type { Request, Response } from 'express';
import type { ApiResponse } from '../../types/api/api.types.js';
import { refreshAccessToken } from '../../services/refresh.service.js';
import { SSO_REFRESH_TOKEN_NAME } from '../../constants/auth.constant.js';
import { clearAuthCookies, setAuthCookies } from '../../utils/cookie.utils.js';

export async function refreshTokens(req: Request, res: Response<ApiResponse>) {
  try {
    const refreshToken = req.cookies?.[SSO_REFRESH_TOKEN_NAME];

    if (typeof refreshToken !== 'string') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized for the access',
      });
    }

    // the service checks the token + session and gives a new access token, here we only deal with http
    const newTokens = await refreshAccessToken(refreshToken);

    if (!newTokens) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: 'Session not found, please login again',
      });
    }

    setAuthCookies(res, {
      accessToken: newTokens.acessToken,
      refreshToken: newTokens.refreshToken,
    });

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
