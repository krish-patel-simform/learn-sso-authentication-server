import { Document, Schema, Types, model } from 'mongoose';

interface ISession extends Document {
  hashedRefreshToken: string;
  userId: Types.ObjectId;
  expireAt: Date;
  isRevoked: boolean;
  parentSessionId: Types.ObjectId | null;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    hashedRefreshToken: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    isRevoked: {
      type: Schema.Types.Boolean,
      default: false,
    },
    expireAt: {
      type: Schema.Types.Date,
      required: true,
    },
    // null  → the SSO's own browser login (the sso_* cookies)
    // an id → a client app's session made by /token, it belongs to that SSO login.
    // removing the SSO login removes these too (single logout)
    parentSessionId: {
      type: Schema.Types.ObjectId,
      ref: 'sessions',
      default: null,
    },
  },
  { timestamps: true },
);

// mongo deletes the session by itself once expireAt has passed
sessionSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ hashedRefreshToken: 1 });
sessionSchema.index({ parentSessionId: 1 });

export const SessionModel = model('sessions', sessionSchema);
