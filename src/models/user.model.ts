import { Schema, model, type HydratedDocument } from 'mongoose';
import { hashPassword } from '../utils/password.utils.js';

export interface IUser {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

const userSchema = new Schema<IUser>(
  {
    first_name: {
      type: Schema.Types.String,
      required: [true, 'First name is required'],
      trim: true,
    },
    last_name: {
      type: Schema.Types.String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: Schema.Types.String,
      required: [true, 'Email is required'],
      trim: true,
      unique: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Please enter a valid email address'],
    },
    password: {
      type: Schema.Types.String,
      trim: true,
      select: false,
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character',
      ],
    },
  },
  { timestamps: true },
);
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  if (!this.password) return;

  const hashedPassword = await hashPassword(this.password);

  this.password = hashedPassword;
});

export type UserDocument = HydratedDocument<IUser>;

export const UserModel = model<IUser>('users', userSchema);
