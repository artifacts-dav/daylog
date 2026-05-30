'use server';

import { encodeHex } from '@/utils/crypto';
import { getSessionEncryptionKey } from '@/utils/encryption';
import { cookies } from 'next/headers';

/**
 * Returns the AES-256 encryption key for the current session, or null if the
 * user has no encryption enabled or the key is not available.
 */
export async function getCurrentSessionKey(): Promise<Buffer | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return null;
    const sessionId = encodeHex(token);
    return getSessionEncryptionKey(sessionId);
  } catch {
    return null;
  }
}
