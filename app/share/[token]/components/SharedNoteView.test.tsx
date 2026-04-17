import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SharedNoteView from './SharedNoteView';

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

describe('SharedNoteView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const mockNote = {
    title: 'Test Note Title',
    content:
      'This is test content with an image ![alt text](/api/v1/images?filePath=test.jpg)',
    imageUrl: 'hero.jpg',
    createdAt: '2023-10-01T12:00:00Z',
    boards: {
      user: {
        name: 'John Doe',
      },
    },
  };

  it('renders note details correctly', () => {
    render(<SharedNoteView note={mockNote} token="test-token" />);

    expect(screen.getByText('Test Note Title')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();

    const expectedDate = new Date(mockNote.createdAt).toLocaleDateString(
      undefined,
      {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      },
    );
    expect(screen.getByText(expectedDate)).toBeInTheDocument();
  });

  it('processes markdown images with proxy URL', () => {
    render(<SharedNoteView note={mockNote} token="test-token" />);

    const markdownDiv = screen.getByTestId('mocked-md-editor-markdown');
    expect(markdownDiv).toHaveTextContent(
      '![alt text](/api/v1/share/test-token/image/test.jpg)',
    );
  });

  it('renders hero image correctly', () => {
    render(<SharedNoteView note={mockNote} token="test-token" />);

    const heroImage = screen.getByAltText('Test Note Title');
    expect(heroImage).toBeInTheDocument();
    expect(heroImage).toHaveAttribute(
      'src',
      '/api/v1/share/test-token/image/hero.jpg',
    );
  });

  it('handles note without optional fields', () => {
    const minNote = {
      title: 'Minimal Note',
      content: null,
      imageUrl: null,
      createdAt: '2023-10-01T12:00:00Z',
      boards: null,
    };

    render(<SharedNoteView note={minNote} token="test-token" />);

    expect(screen.getByText('Minimal Note')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });
});
