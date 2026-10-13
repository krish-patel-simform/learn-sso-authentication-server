export const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;
export const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// where the routers are mounted (index.ts).
// public/auth-page.js can not import this, so keep API_BASE / AUTHORIZE_PATH there in sync
//   AUTH_BASE_PATH  → the user's own session: register, login, refresh, logout, me
//   OAUTH_BASE_PATH → the SSO protocol for client apps: authorize, token
export const AUTH_BASE_PATH = '/api/auth';
export const OAUTH_BASE_PATH = '/api/oauth';

// same path as the access cookie, so both are set, sent and cleared the same way.
// the browser sends a cookie only when the url starts with its path, and the refresh cookie must reach
// BOTH /api/auth/refresh and /api/oauth/authorize (silent refresh)
export const REFRESH_COOKIE_PATH = '/';

// the code is only a short-lived ticket, the app must swap it for tokens quickly
export const AUTH_CODE_MAX_AGE_MS = 60 * 1000;

export const SSO_ACCESS_TOKEN_NAME = 'sso_access_token';
export const SSO_REFRESH_TOKEN_NAME = 'sso_refresh_token';
