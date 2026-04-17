import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import PasswordEntry from './PasswordEntry';
import { useRouter } from 'next/navigation';
import { verifySharePassword } from '../lib/actions';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('../lib/actions', () => ({
  verifySharePassword: vi.fn(),
}));

describe('PasswordEntry', () => {
  const mockRouterRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as Mock).mockReturnValue({
      refresh: mockRouterRefresh,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly', () => {
    render(<PasswordEntry token="test-token" />);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View Content' })).toBeInTheDocument();
  });

  it('displays error if passed in props', () => {
    render(<PasswordEntry token="test-token" error="Initial error" />);
    expect(screen.getByText('Initial error')).toBeInTheDocument();
  });

  it('handles successful password verification', async () => {
    (verifySharePassword as Mock).mockResolvedValue({ success: true });

    render(<PasswordEntry token="test-token" />);
    
    const input = screen.getByPlaceholderText('Enter password');
    fireEvent.change(input, { target: { value: 'password123' } });
    
    const button = screen.getByRole('button', { name: 'View Content' });
    fireEvent.click(button);

    expect(screen.getByRole('button', { name: 'Verifying...' })).toBeInTheDocument();

    await waitFor(() => {
      expect(verifySharePassword).toHaveBeenCalledWith('test-token', 'password123');
      expect(mockRouterRefresh).toHaveBeenCalled();
    });
  });

  it('handles failed password verification', async () => {
    (verifySharePassword as Mock).mockResolvedValue({ success: false, error: 'Wrong password' });

    render(<PasswordEntry token="test-token" />);
    
    const input = screen.getByPlaceholderText('Enter password');
    fireEvent.change(input, { target: { value: 'wrongpass' } });
    
    const button = screen.getByRole('button', { name: 'View Content' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(verifySharePassword).toHaveBeenCalledWith('test-token', 'wrongpass');
      expect(screen.getByText('Wrong password')).toBeInTheDocument();
      expect(mockRouterRefresh).not.toHaveBeenCalled();
    });
  });

  it('handles generic errors during verification', async () => {
    (verifySharePassword as Mock).mockRejectedValue(new Error('Network error'));

    render(<PasswordEntry token="test-token" />);
    
    const input = screen.getByPlaceholderText('Enter password');
    fireEvent.change(input, { target: { value: 'pass' } });
    
    const button = screen.getByRole('button', { name: 'View Content' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument();
    });
  });
});
