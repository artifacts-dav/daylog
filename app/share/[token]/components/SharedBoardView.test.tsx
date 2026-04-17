import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SharedBoardView from './SharedBoardView';

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img alt="" {...(props as Record<string, unknown>)} />;
  },
}));

vi.mock('@uiw/react-md-editor', () => {
  const Markdown = ({ source }: { source: string }) => {
    return <div data-testid="mocked-md-editor-markdown">{source}</div>;
  };
  return {
    __esModule: true,
    default: { Markdown },
  };
});

describe('SharedBoardView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const mockBoard = {
    title: 'Test Board Title',
    description: 'This is a test board description.',
    imageUrl: 'hero-board.jpg',
    user: { name: 'Alice Smith' },
    notes: [
      {
        id: 1,
        title: 'Note 1',
        content: 'Content 1',
        imageUrl: 'note1.jpg',
        createdAt: '2023-10-01T12:00:00Z',
      },
      {
        id: 2,
        title: 'Note 2',
        content: 'Content 2',
        imageUrl: null,
        createdAt: '2023-10-02T12:00:00Z',
      },
    ],
  };

  it('renders board header correctly', () => {
    render(<SharedBoardView board={mockBoard} token="test-token" />);

    expect(screen.getByText('Test Board Title')).toBeInTheDocument();
    expect(screen.getByText('This is a test board description.')).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    
    // Check note count (2 notes)
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders list of notes', () => {
    render(<SharedBoardView board={mockBoard} token="test-token" />);

    expect(screen.getByText('Note 1')).toBeInTheDocument();
    expect(screen.getByText('Note 2')).toBeInTheDocument();
  });

  it('opens note modal when a note is clicked', () => {
    render(<SharedBoardView board={mockBoard} token="test-token" />);

    // Note 1 shouldn't be fully displayed in a dialog initially 
    // DialogTitle contains the title in the modal
    
    // Find the note card and click it
    const noteCard1 = screen.getByText('Note 1').closest('div[role="button"]');
    if (!noteCard1) throw new Error('Note card not found');
    
    fireEvent.click(noteCard1);

    // After clicking, the note content (Markdown) should be visible in the modal
    const markdownDiv = screen.getByTestId('mocked-md-editor-markdown');
    expect(markdownDiv).toHaveTextContent('Content 1');
  });

  it('handles missing board images and descriptions', () => {
    const minBoard = {
      title: 'Minimal Board',
      description: null,
      imageUrl: null,
      user: null,
      notes: [],
    };

    render(<SharedBoardView board={minBoard} token="test-token" />);

    expect(screen.getByText('Minimal Board')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });
});
