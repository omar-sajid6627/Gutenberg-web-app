"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchBookById, type BookSummary } from '@/app/services/api';
import { useDebounce } from '@/app/hooks/useDebounce';
import { displayAuthor } from '@/lib/recent-books';

type Lookup =
  | { kind: 'idle' }
  | { kind: 'invalid' }
  | { kind: 'loading' }
  | { kind: 'found'; book: BookSummary }
  | { kind: 'missing'; id: string };

/**
 * Finds a book by its Project Gutenberg ebook number. The backend has no
 * title search, so the field says so rather than pretending to search.
 */
export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [lookup, setLookup] = useState<Lookup>({ kind: 'idle' });
  const debouncedQuery = useDebounce(query.trim(), 400);

  useEffect(() => {
    if (!debouncedQuery) return setLookup({ kind: 'idle' });
    if (!/^\d+$/.test(debouncedQuery)) return setLookup({ kind: 'invalid' });

    let cancelled = false;
    setLookup({ kind: 'loading' });
    fetchBookById(debouncedQuery)
      .then((book) => !cancelled && setLookup({ kind: 'found', book }))
      .catch(() => !cancelled && setLookup({ kind: 'missing', id: debouncedQuery }));
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const id = query.trim();
    if (/^\d+$/.test(id)) router.push(`/book/${id}`);
    else setLookup({ kind: 'invalid' });
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="w-full">
      <label htmlFor="book-id" className="mb-2 block text-sm font-medium">
        Gutenberg ebook number
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            id="book-id"
            inputMode="numeric"
            autoComplete="off"
            placeholder="1342"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-describedby="book-id-status"
            className="h-12 bg-card pl-10 text-lg"
          />
        </div>
        <Button type="submit" size="lg" className="h-12 gap-2">
          Open
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
      <div id="book-id-status" aria-live="polite" className="mt-2 min-h-[1.5rem] text-sm">
        {lookup.kind === 'invalid' && <p className="text-destructive">Ebook numbers are digits only, like 1342.</p>}
        {lookup.kind === 'loading' && (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Looking it up…
          </p>
        )}
        {lookup.kind === 'found' && (
          <p className="text-muted-foreground">
            <span className="font-serif font-semibold text-foreground">{lookup.book.title}</span> by{' '}
            {displayAuthor(lookup.book.author)}
          </p>
        )}
        {lookup.kind === 'missing' && <p className="text-muted-foreground">No book found under {lookup.id}.</p>}
      </div>
    </form>
  );
}
