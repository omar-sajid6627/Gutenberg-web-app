import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BookReader } from '@/app/book/[id]/read/BookReader';
import { fixtures } from './fixtures';

const book = { id: '1342', title: 'Pride and Prejudice', author: 'Austen, Jane, 1775-1817', ebookNo: '1342' };

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
});

describe('BookReader', () => {
  it('pages through the text it was given without fetching it again', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    render(<BookReader book={book} pages={fixtures['1342'].content.pages} />);

    expect(screen.getByText(/It is a truth universally acknowledged/)).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: /next page/i }));

    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    expect(screen.getByText(/What is his name\?/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled();
    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('links to Project Gutenberg when there is no text', () => {
    render(<BookReader book={book} pages={[]} />);

    expect(screen.getByText(/text is not available here/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open on gutenberg\.org/i })).toHaveAttribute(
      'href',
      'https://www.gutenberg.org/ebooks/1342',
    );
    expect(screen.queryByRole('navigation', { name: 'Pages' })).not.toBeInTheDocument();
  });
});
