import type { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { extractAnswer, forwardQuestion, forwardSentiment } from '@/lib/backend';
import { POST as askRoute } from '@/app/api/books/[id]/ask/route';
import { fixtures, jsonResponse } from './fixtures';

afterEach(() => vi.unstubAllGlobals());

describe('extractAnswer', () => {
  it('accepts every shape the backend has used', () => {
    expect(extractAnswer({ response: 'From the response field' })).toBe('From the response field');
    expect(extractAnswer({ answer: 'From the answer field' })).toBe('From the answer field');
    expect(extractAnswer('A bare string')).toBe('A bare string');
  });

  it('rejects anything that is not an answer', () => {
    expect(extractAnswer({ response: '   ' })).toBeNull();
    expect(extractAnswer({ detail: 'oops' })).toBeNull();
    expect(extractAnswer(null)).toBeNull();
  });
});

describe('forwardQuestion', () => {
  it('posts the question to the backend and returns the answer under the field', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ response: 'Netherfield Park is let.' }));
    vi.stubGlobal('fetch', fetchMock);

    const res = await forwardQuestion('1342', 'What is let?', 0, 'answer');

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ answer: 'Netherfield Park is let.' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/books\/1342\/ask$/);
    expect(JSON.parse(init.body)).toEqual({ book_id: '1342', query: 'What is let?', temperature: 0 });
  });

  it('passes the backend status through on failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Book content not found', { status: 404 })));

    const res = await forwardQuestion('999999', 'Anything?', 0, 'answer');

    expect(res.status).toBe(404);
    expect((await res.json()).details).toBe('Book content not found');
  });

  it('reports an unreachable backend as 502', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));

    const res = await forwardQuestion('1342', 'Anything?', 0, 'summary');

    expect(res.status).toBe(502);
  });

  it('reports a reply without an answer as 502 instead of echoing it', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ query: 'x', book_id: '1342' })));

    const res = await forwardQuestion('1342', 'x', 0, 'answer');

    expect(res.status).toBe(502);
  });
});

describe('forwardSentiment', () => {
  it('returns the backend result unchanged', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(fixtures['1342'].sentiment)));

    const res = await forwardSentiment('1342');

    expect(await res.json()).toEqual(fixtures['1342'].sentiment);
  });
});

describe('POST /api/books/[id]/ask', () => {
  it('rejects an empty question without calling the backend', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const request = new Request('http://localhost/api/books/1342/ask', {
      method: 'POST',
      body: JSON.stringify({ query: '  ' }),
    });

    const res = await askRoute(request as NextRequest, { params: { id: '1342' } });

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
