import jwt from 'jsonwebtoken';

// ids are strings: ObjectIds become strings once serialized into a JWT
export interface AccessTokenPayload extends jwt.JwtPayload {
  userId: string;
  sessionId: string;
}

export interface RefreshTokenPaylaod extends jwt.JwtPayload {
  userID: string;
}
