import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from '../constants/bcrypt.constant.js';

// bcrypt is for passwords only: it is salted (different hash every time) so compare with verifyPassword
export function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

export function verifyPassword(plainText: string, hashedText: string): Promise<boolean> {
  return bcrypt.compare(plainText, hashedText);
}
