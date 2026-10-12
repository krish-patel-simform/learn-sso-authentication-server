export const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;
export const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// refresh cookie is only sent to the auth routes, not every request
export const REFRESH_COOKIE_PATH = '/api/auth';
