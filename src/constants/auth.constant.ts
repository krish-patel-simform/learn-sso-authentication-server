export const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;
export const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// refresh cookie is only sent to the auth routes, not every request
export const REFRESH_COOKIE_PATH = '/api/auth';

// the code is only a short-lived ticket, the app must swap it for tokens quickly
export const AUTH_CODE_MAX_AGE_MS = 60 * 1000;

export const SSO_ACCESS_TOKEN_NAME = 'sso_access_token';
export const SSO_REFRESH_TOKEN_NAME = 'sso_refresh_token';
