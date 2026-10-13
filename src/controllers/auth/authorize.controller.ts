import type { Request, Response } from 'express';
import type { ApiResponse } from '../../types/api/api.types.js';
import type { ClientDocument } from '../../models/client.model.js';
import { checkAccessToken } from '../../services/sessions/verifySession.service.js';
import { createAuthCode } from '../../services/authCode.service.js';
import { SSO_ACCESS_TOKEN_NAME, SSO_REFRESH_TOKEN_NAME } from '../../constants/auth.constant.js';
import { refreshAccessToken } from '../../services/refresh.service.js';
import { setAuthCookies } from '../../utils/cookie.utils.js';

// validateClient runs first, so client_id, redirect_uri, state and code_challenge
// are already checked and the client is on res.locals.client
export async function authorize(req: Request, res: Response<ApiResponse>) {
  try {
    const client = res.locals.client as ClientDocument;
    const { redirect_uri, state, code_challenge, client_id } = req.query as Record<string, string>;

    // is the user logged in to the auth server? (same check as authMiddleware)

    if (
      typeof client_id !== 'string' ||
      typeof redirect_uri !== 'string' ||
      typeof state !== 'string' ||
      typeof code_challenge !== 'string' ||
      !client_id ||
      !redirect_uri ||
      !state ||
      !code_challenge
    ) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing',
      });
    }

    const check = await checkAccessToken(req.cookies?.[SSO_ACCESS_TOKEN_NAME]);

    // filled in below, either from the access token or from a refresh
    let userId: string;

    if (check.valid) {
      userId = check.user.id;
    } else {
      // access token is not usable (missing / invalid / expired / session gone): try the refresh token.
      // 'session_invalid' means logout or revoke, the refresh token belongs to that same session so it would fail too
      const refreshToken = req.cookies?.[SSO_REFRESH_TOKEN_NAME];

      const newTokens =
        check.reason !== 'session_invalid' && typeof refreshToken === 'string'
          ? await refreshAccessToken(refreshToken)
          : null;

      // browser request: send the user to the login page and come back to this exact url afterwards
      if (!newTokens) {
        return res.redirect(`/login?returnTo=${encodeURIComponent(req.originalUrl)}`);
      }

      // here got the new accesstoken and need to save that token
      setAuthCookies(res, {
        accessToken: newTokens.acessToken,
        refreshToken: newTokens.refreshToken,
      });

      userId = newTokens.userId;
    }

    const code = await createAuthCode({
      clientId: client.clientId,
      userId,
      redirectUri: redirect_uri,
      codeChallenge: code_challenge,
    });

    // build the url with URL so the values are encoded correctly
    const callbackUrl = new URL(redirect_uri);
    callbackUrl.searchParams.set('code', code);
    callbackUrl.searchParams.set('state', state);

    res.setHeader('Cache-Control', 'no-store');
    return res.redirect(callbackUrl.toString());
  } catch (error) {
    console.log('[authorize controller] error : ', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
}
