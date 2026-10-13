import type { Request, Response } from 'express';
import type { ApiResponse } from '../../types/api/api.types.js';
import { verifyClientSecret } from '../../services/client.service.js';
import { consumeAuthCode } from '../../services/authCode.service.js';
import { createSession } from '../../services/sessions/createSession.service.js';
import { verifyCodeChallenge } from '../../utils/pkce.utils.js';
import { ACCESS_TOKEN_MAX_AGE_MS } from '../../constants/auth.constant.js';

interface TokenRequestBody {
  authorizedCode: string;
  codeVerifier: string;
  clientSecret: string;
  clientId: string;
  redirectUri: string;
}

// called by the client app's BACKEND (never the browser): swaps the one-time code for tokens
export async function token(
  req: Request<unknown, null, TokenRequestBody>,
  res: Response<ApiResponse>,
) {
  try {
    const { authorizedCode, clientId, clientSecret, codeVerifier, redirectUri } = req.body;

    // typeof checks also stop objects like { "$ne": null } reaching the database query
    if (
      typeof authorizedCode !== 'string' ||
      typeof clientId !== 'string' ||
      typeof clientSecret !== 'string' ||
      typeof codeVerifier !== 'string' ||
      typeof redirectUri !== 'string' ||
      !authorizedCode ||
      !clientId ||
      !clientSecret ||
      !codeVerifier ||
      !redirectUri
    ) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing',
      });
    }

    // the redirect url with the code is saved in the browser history, so the code alone proves nothing.
    // the secret is known only by the app's backend, so it shows the request comes from the real app
    const isValidClient = await verifyClientSecret(clientId, clientSecret);

    if (!isValidClient) {
      return res.status(401).json({
        success: false,
        message: 'Invalid client',
      });
    }

    // find the code and mark it used in one step (a code works only once)
    const authCode = await consumeAuthCode(authorizedCode);

    // one message for every failure, so an attacker can not tell which check failed
    if (
      !authCode ||
      // issued to a different app
      authCode.clientId !== clientId ||
      // must be the exact redirect uri used in /authorize
      authCode.redirectUri !== redirectUri ||
      // PKCE: this is the same app request that started the login
      !verifyCodeChallenge(codeVerifier, authCode.codeChallenge)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired authorization code',
      });
    }

    // every check passed: create the app's session and tokens for the user who logged in
    //
    const tokens = await createSession(authCode.userId.toString());

    // tokens must never be cached
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');

    return res.status(200).json({
      success: true,
      message: 'Tokens created',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenType: 'Bearer',
        expiresIn: ACCESS_TOKEN_MAX_AGE_MS / 1000,
      },
    });
  } catch (error) {
    console.log('[token controller] error : ', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
}
