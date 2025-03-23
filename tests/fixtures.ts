import alice from '@/fixtures/books/11.json';
import prideAndPrejudice from '@/fixtures/books/1342.json';
import frankenstein from '@/fixtures/books/84.json';

export const fixtures = { '11': alice, '1342': prideAndPrejudice, '84': frankenstein };

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
