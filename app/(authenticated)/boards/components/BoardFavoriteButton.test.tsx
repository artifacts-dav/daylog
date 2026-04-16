import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import BoardFavoriteButton from './BoardFavoriteButton';
import { Board } from '@/prisma/generated/client';
import { useRouter } from 'next/navigation';
import { updateBoard } from '@/app/(authenticated)/boards/lib/actions';

vi.mock('@/app/(authenticated)/boards/lib/actions', () => ({
  updateBoard: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('BoardFavoriteButton', () => {
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

  const mockBoard = {
    id: '1',
    title: 'Test Board',
    favorite: false,
  } as unknown as Board;

  it('renders outline heart when board is not favorited', () => {
    render(<BoardFavoriteButton board={mockBoard} />);
    expect(screen.getByText('Add to favorites')).toBeInTheDocument();
    expect(screen.queryByTestId('filled-heart')).not.toBeInTheDocument();
  });

  it('renders solid heart when board is favorited', () => {
    render(<BoardFavoriteButton board={{ ...mockBoard, favorite: true }} />);
    expect(screen.getByText('Remove from favorites')).toBeInTheDocument();
    expect(screen.getByTestId('filled-heart')).toBeInTheDocument();
  });

  it('calls updateBoard and router.refresh on click', async () => {
    const board = { ...mockBoard, favorite: false };
    render(<BoardFavoriteButton board={board} />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);

    await waitFor(() => {
      expect(updateBoard).toHaveBeenCalledWith({ ...board, favorite: true });
      expect(mockRouterRefresh).toHaveBeenCalled();
    });
  });
});
