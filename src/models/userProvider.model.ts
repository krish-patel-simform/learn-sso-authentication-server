import { Document, model, Schema, Types } from 'mongoose';

interface IUserProvider extends Document {
  userId: Types.ObjectId;
  providerSubjectId: string;
  provider: string;
}

const userProviderSchema = new Schema<IUserProvider>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    providerSubjectId: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

// one provider account can be linked to only one user
userProviderSchema.index({ provider: 1, providerSubjectId: 1 }, { unique: true });

export const UserProviderModel = model('user-providers', userProviderSchema);
