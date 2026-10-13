import type { Request, Response } from 'express';
import type { ApiResponse } from '../../types/api/api.types.js';
import { findClient, isRedirectOriginAllowed } from '../../services/client.service.js';
import { removeSession } from '../../services/sessions/removeSession.service.js';
import { clearAuthCookies } from '../../utils/cookie.utils.js';

// browser logout: the app sends the user's BROWSER here, so the sso_* cookies come with the request.
// GET /api/oauth/logout?client_id=...&redirectTo=<url on the app>
// oauthMiddleware runs first and gives req.ssoSessionId (undefined when there is no session)
export async function oauthLogout(req: Request, res: Response<ApiResponse>) {
  try {
    // query values are not guaranteed to be strings (?a=1&a=2 gives an array)
    const { client_id, redirectTo } = req.query;

    if (
      typeof client_id !== 'string' ||
      typeof redirectTo !== 'string' ||
      !client_id ||
      !redirectTo
    ) {
      return res.status(400).json({
        success: false,
        message: 'client_id and redirectTo are required',
      });
    }

    const client = await findClient(client_id);

    // validate BEFORE changing anything, and only send the user to a site of this client,
    // otherwise /logout is an open redirect (?redirectTo=https://evil.com)
    if (!client || !isRedirectOriginAllowed(client, redirectTo)) {
      return res.status(400).json({
        success: false,
        message: 'redirectTo is not allowed for this client',
      });
    }

    if (req.ssoSessionId) {
      await removeSession(req.ssoSessionId);
    }

    // cleared even when there was no session, so no stale cookie stays in the browser
    clearAuthCookies(res);

    res.setHeader('Cache-Control', 'no-store');
    return res.redirect(redirectTo);
  } catch (error) {
    console.log('[oauth logout controller] error : ', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
}
