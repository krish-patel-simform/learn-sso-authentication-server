import { SessionModel } from '../models/session.model.js';
import { hashToken } from '../utils/token.utils.js';
import { createAccessToken, verifyRefreshToken } from './jwt.service.js';

// used by both /refresh and /authorize, so there is no req / res / cookies in here.
// it only gives a NEW ACCESS token. the refresh token is NOT changed and its expiry is NOT extended,
// so when the refresh token (or the session) expires the user has to login again
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

  // userId and sessionId are returned too, the caller (/authorize) needs to know whose session this is
  return {
    userId: refreshDecoded.userID,
    sessionId: sessionExist._id.toString(),
    acessToken: newAccessToken,
    refreshToken: refreshToken,
  };
}
