import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, beforeAll, afterEach, Mock } from 'vitest';
import BoardModalDelete from './BoardModalDelete';
import { Board } from '@/prisma/generated/client';
import { useRouter } from 'next/navigation';
import { deleteBoard } from '@/app/(authenticated)/boards/lib/actions';

vi.mock('@/app/(authenticated)/boards/lib/actions', () => ({
  deleteBoard: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('BoardModalDelete', () => {
  const mockRouterRefresh = vi.fn();

  beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    window.HTMLElement.prototype.hasPointerCapture = vi.fn();
    window.HTMLElement.prototype.releasePointerCapture = vi.fn();
    
    if (typeof global.ResizeObserver === 'undefined') {
      global.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      } as unknown as typeof ResizeObserver;
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as Mock).mockReturnValue({
      refresh: mockRouterRefresh,
    });
  });

  afterEach(() => {
    cleanup();
  });

  const mockBoard = {
    id: '1',
    title: 'Test Board',
  } as unknown as Board;

  it('renders the delete button', () => {
    render(<BoardModalDelete board={mockBoard} />);
    expect(screen.getByRole('button', { name: "Delete board" })).toBeInTheDocument();
  });

  it('opens the dialog when clicked', async () => {
    render(<BoardModalDelete board={mockBoard} />);
    fireEvent.click(screen.getByRole('button', { name: "Delete board" }));
    
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete Board')).toBeInTheDocument();
    expect(screen.getByText('Test Board')).toBeInTheDocument();
  });

  it('calls deleteBoard and refreshes on confirm', async () => {
    render(<BoardModalDelete board={mockBoard} />);
    fireEvent.click(screen.getByRole('button', { name: "Delete board" }));
    
    const confirmButton = await screen.findByRole('button', { name: 'Confirm Delete' });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(deleteBoard).toHaveBeenCalledWith(mockBoard);
      expect(mockRouterRefresh).toHaveBeenCalled();
    });
  });
});
