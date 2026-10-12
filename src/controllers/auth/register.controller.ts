import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import type { ApiResponse } from '../../types/api/api.types.js';
import type { RegisterUserBody } from '../../types/auth/auth.types.js';
import { UserModel } from '../../models/user.model.js';
import { createSession } from '../../services/sessions/createSession.service.js';
import { setAuthCookies } from '../../utils/cookie.utils.js';

export async function register(
  req: Request<null, null, RegisterUserBody>,
  res: Response<ApiResponse>,
) {
  try {
    const { email, first_name, last_name, password } = (req.body ??
      {}) as Partial<RegisterUserBody>;

    // typeof check also blocks objects like { "$gt": "" } being sent instead of strings
    if (
      typeof first_name !== 'string' ||
      typeof last_name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !first_name ||
      !last_name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing',
      });
    }

    const user = await UserModel.create({ first_name, last_name, email, password });

    const tokens = await createSession(user._id.toString());
    setAuthCookies(res, tokens);

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        userId: user._id,
      },
    });
  } catch (error) {
    // duplicate email (unique index)
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // schema rules (email format, password strength ...)
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)[0]?.message ?? 'Invalid data',
      });
    }

    console.log('[register controller] error :', error instanceof Error ? error.message : error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
