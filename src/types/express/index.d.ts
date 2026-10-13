import type { AuthUser } from '../auth/auth.types.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      // set by oauthMiddleware from the sso_* cookies of the browser
      ssoSessionId?: string | undefined;
    }
  }
}
