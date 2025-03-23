import { apiUrl } from '@/lib/api';

export interface BookSummary {
  id: string;
  title: string;
  author: string;
}

/** Looks a book up from the browser; the backend has no full-text search. */
export async function fetchBookById(id: string): Promise<BookSummary> {
  const response = await fetch(apiUrl(`/books/${encodeURIComponent(id)}`));

  if (!response.ok) {
    throw new Error(`Failed to fetch book: ${response.status}`);
  }

  return response.json();
}
