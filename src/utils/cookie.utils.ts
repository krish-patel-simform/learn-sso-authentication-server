import type { CookieOptions, Response } from 'express';
import { env } from '../config/env.js';
import {
  ACCESS_TOKEN_MAX_AGE_MS,
  REFRESH_COOKIE_PATH,
  REFRESH_TOKEN_MAX_AGE_MS,
} from '../constants/auth.constant.js';

const baseOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.NODE_ENV === 'production',
};

const accessOptions: CookieOptions = { ...baseOptions, path: '/' };
const refreshOptions: CookieOptions = { ...baseOptions, path: REFRESH_COOKIE_PATH };

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
) {
  res.cookie('accessToken', tokens.accessToken, {
    ...accessOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE_MS,
  });
  res.cookie('refreshToken', tokens.refreshToken, {
    ...refreshOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie('accessToken', accessOptions);
  res.clearCookie('refreshToken', refreshOptions);
}
