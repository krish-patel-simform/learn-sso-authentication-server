import { createHash } from 'node:crypto';

// SHA-256 is deterministic (same token -> same hash) so we can look a session up by it.
// A random JWT is already high-entropy, so it does not need a slow salted hash like bcrypt.
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
