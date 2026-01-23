import { sha256 } from '@oslojs/crypto/sha2';
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from '@oslojs/encoding';
import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';

export function encodeBase32(bytes: Uint8Array) {
  return encodeBase32LowerCaseNoPadding(bytes);
}

export function encodeHex(token: string): string {
  return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  // Legacy SHA256 hash check
  if (hashedPassword.length === 64 && /^[a-f0-9]{64}$/.test(hashedPassword)) {
    return signPasswordLegacy(password) === hashedPassword;
  }
  return await bcrypt.compare(password, hashedPassword);
}

export function signPasswordLegacy(password: string): string {
  return createHash('sha256')
    .update(password, 'utf8')
    .digest('hex');
}
