"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { fetchBookById, BookDetails } from '@/app/services/api';
import Link from 'next/link';
import { useDebounce } from '@/app/hooks/useDebounce';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<BookDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    async function performSearch() {
      // Reset results if query is empty or too short
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      // Only proceed if the query is a numeric ID
      if (!/^\d+$/.test(debouncedQuery)) {
        setError("Please enter a numeric book ID");
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Search by ID only
        const book = await fetchBookById(debouncedQuery);
        setResults([book]); // Put the book in an array for consistent rendering
      } catch (err) {
        console.error('Search error:', err);
        setError(`No book found with ID: ${debouncedQuery}`);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }

    performSearch();
  }, [debouncedQuery]);

  return (
    <div className="relative">
      <motion.div
        initial={false}
        animate={{
          scale: isFocused ? 1.02 : 1,
          boxShadow: isFocused 
            ? '0 8px 30px rgba(0,0,0,0.12)' 
            : '0 2px 8px rgba(0,0,0,0.05)',
        }}
        className="relative flex items-center"
      >
        <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by book ID (e.g. 1342 for Pride and Prejudice)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="w-full pl-12 pr-4 h-12 text-lg bg-card border-2 focus:border-primary transition-colors"
        />
      </motion.div>

      <AnimatePresence>
        {isFocused && query.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 p-2 bg-card rounded-lg border shadow-lg z-50 max-h-[400px] overflow-auto"
          >
            {isLoading ? (
              <div className="text-sm p-3 text-center">
                <div className="animate-pulse">Searching...</div>
              </div>
            ) : error ? (
              <div className="text-sm p-3 text-red-500">{error}</div>
            ) : results.length > 0 ? (
              <div className="space-y-2">
                {results.map((book) => (
                  <Link 
                    key={book.id} 
                    href={`/book/${book.id}`}
                    className="block p-2 hover:bg-muted rounded-md transition-colors"
                  >
                    <div className="font-medium">{book.title}</div>
                    <div className="text-sm text-muted-foreground">{book.author}</div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-sm p-3 text-muted-foreground">
                Enter a valid book ID to search
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}