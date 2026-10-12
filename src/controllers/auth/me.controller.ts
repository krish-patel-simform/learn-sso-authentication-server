import type { Request, Response } from 'express';
import type { ApiResponse } from '../../types/api/api.types.js';
import { UserModel } from '../../models/user.model.js';

// authMiddleware runs first, so req.user is already verified here
export async function me(req: Request, res: Response<ApiResponse>) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // lean() gives a plain object (spreading a mongoose document gives internal junk)
    const user = await UserModel.findById(req.user.id).select('-__v -_id').lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User session is invalid',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User found',
      data: user,
    });
  } catch (error) {
    console.log('[me controller] error : ', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
