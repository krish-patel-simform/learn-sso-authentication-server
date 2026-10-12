import { model, Schema, type Types } from 'mongoose';

export interface IAuthCode {
  hashedCode: string;
  clientId: string;
  userId: Types.ObjectId;
  redirectUri: string;
  codeChallenge: string;
  expiresAt: Date;
  isUsed: boolean;
}

const authCodeSchema = new Schema<IAuthCode>(
  {
    // only the hash is stored (same idea as the refresh token)
    hashedCode: { type: Schema.Types.String, required: true, unique: true },
    clientId: { type: Schema.Types.String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    // /token must receive the exact same redirect uri that was used here
    redirectUri: { type: Schema.Types.String, required: true },
    // PKCE: /token checks the app's code_verifier against this
    codeChallenge: { type: Schema.Types.String, required: true },
    expiresAt: { type: Schema.Types.Date, required: true },
    // a code can be used only once
    isUsed: { type: Schema.Types.Boolean, default: false },
  },
  { timestamps: true },
);

// mongo deletes the code by itself once expiresAt has passed
authCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AuthCodeModel = model<IAuthCode>('auth-codes', authCodeSchema);
