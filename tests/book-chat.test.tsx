import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ASK_TIMEOUT_MS, BookChat } from '@/app/components/BookChat';
import { jsonResponse } from './fixtures';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

async function openAndAsk(question: string) {
  const user = vi.isFakeTimers() ? userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) }) : userEvent.setup();
  await user.click(screen.getByRole('button', { name: /ask about this book/i }));
  await user.type(screen.getByLabelText(/your question/i), question);
  await user.click(screen.getByRole('button', { name: /send question/i }));
}

describe('BookChat', () => {
  it('shows the answer returned by the ask route', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ answer: 'Netherfield Park is let at last.' }));
    vi.stubGlobal('fetch', fetchMock);
    render(<BookChat bookId="1342" bookTitle="Pride and Prejudice" />);

    await openAndAsk('What news does Mrs. Bennet bring?');

    expect(await screen.findByText('Netherfield Park is let at last.')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toBe('/api/books/1342/ask');
  });

  it('shows the error from the route instead of retrying against the backend', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ error: 'The book service is unreachable' }, 502));
    vi.stubGlobal('fetch', fetchMock);
    render(<BookChat bookId="1342" bookTitle="Pride and Prejudice" />);

    await openAndAsk('Who is Mr. Bingley?');

    expect(await screen.findByText('The book service is unreachable')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('gives up after the timeout and re-enables the input', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
        }),
      ),
    );
    render(<BookChat bookId="1342" bookTitle="Pride and Prejudice" />);

    await openAndAsk('Will this ever answer?');
    expect(screen.getByRole('status')).toHaveTextContent(/looking through the text/i);

    await act(async () => {
      vi.advanceTimersByTime(ASK_TIMEOUT_MS);
    });

    expect(await screen.findByText(/no answer within a minute/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your question/i)).toBeEnabled();
  });
});
