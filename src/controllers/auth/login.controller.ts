import type { Request, Response } from 'express';
import type { ApiResponse } from '../../types/api/api.types.js';
import type { LoginUserBody } from '../../types/auth/auth.types.js';
import { UserModel } from '../../models/user.model.js';
import { createSession } from '../../services/sessions/createSession.service.js';
import { verifyPassword } from '../../utils/password.utils.js';
import { setAuthCookies } from '../../utils/cookie.utils.js';

export async function login(req: Request<null, null, LoginUserBody>, res: Response<ApiResponse>) {
  try {
    const { email, password } = (req.body ?? {}) as Partial<LoginUserBody>;

    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Required Fields are missing',
      });
    }

    // password is select:false in the schema, so ask for it explicitly
    const user = await UserModel.findOne({ email: email.trim().toLowerCase() }).select('+password');

    // same message for "no user" and "wrong password" so nobody can find out which emails exist
    // (user.password can be empty for users who signed up through a provider)
    if (!user || !user.password || !(await verifyPassword(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const tokens = await createSession(user._id.toString());
    setAuthCookies(res, tokens);

    return res.status(200).json({
      success: true,
      message: 'User logged in',
      data: {
        userID: user._id,
      },
    });
  } catch (error) {
    console.log('[login controller] error : ', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
