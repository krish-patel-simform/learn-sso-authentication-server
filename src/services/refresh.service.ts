import { SessionModel } from '../models/session.model.js';
import { hashToken } from '../utils/token.utils.js';
import { createAccessToken, verifyRefreshToken } from './jwt.service.js';

export async function refreshAccessToken(refreshToken: string) {
  // valdaite teh reresh token and session

  const refreshDecoded = verifyRefreshToken(refreshToken);

  if (!refreshDecoded) return null;

  // check session exist
  const sessionExist = await SessionModel.exists({
    userId: refreshDecoded.userID,
    hashedRefreshToken: hashToken(refreshToken),
    isRevoked: false,
    expireAt: { $gt: new Date() },
  });

  if (!sessionExist) {
    return null;
  }

  // we have an valid token and sesion
  const newAccessToken = createAccessToken({
    sessionId: sessionExist._id.toString(),
    userId: refreshDecoded.userID,
  });

  return { acessToken: newAccessToken, refreshToken: refreshToken };
}
