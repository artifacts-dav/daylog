import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { verifySharePassword } from './actions';
import { prisma } from '@/prisma/client';
import { verifyPassword } from '@/utils/crypto';
import { cookies } from 'next/headers';

vi.mock('@/prisma/client', () => ({
  prisma: {
    share: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/utils/crypto', () => ({
  verifyPassword: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('verifySharePassword', () => {
  const mockSetCookie = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (cookies as Mock).mockResolvedValue({
      set: mockSetCookie,
    });
  });

  it('throws an error if share is not found', async () => {
    (prisma.share.findUnique as Mock).mockResolvedValue(null);

    await expect(verifySharePassword('invalid-token', 'password')).rejects.toThrow('Share not found or not password protected');
  });

  it('throws an error if share is not password protected', async () => {
    (prisma.share.findUnique as Mock).mockResolvedValue({ id: 'token', password: null });

    await expect(verifySharePassword('token', 'password')).rejects.toThrow('Share not found or not password protected');
  });

  it('returns false and error message for invalid password', async () => {
    (prisma.share.findUnique as Mock).mockResolvedValue({ id: 'token', password: 'hashed-password' });
    (verifyPassword as Mock).mockResolvedValue(false);

    const result = await verifySharePassword('token', 'wrong-password');
    expect(result).toEqual({ success: false, error: 'Invalid password' });
    expect(mockSetCookie).not.toHaveBeenCalled();
  });

  it('returns true and sets a cookie for valid password', async () => {
    (prisma.share.findUnique as Mock).mockResolvedValue({ id: 'token', password: 'hashed-password' });
    (verifyPassword as Mock).mockResolvedValue(true);

    const result = await verifySharePassword('token', 'correct-password');
    expect(result).toEqual({ success: true });
    expect(mockSetCookie).toHaveBeenCalledWith(
      'share_auth_token',
      'authorized',
      expect.objectContaining({
        httpOnly: true,
        path: '/',
      })
    );
  });
});
