import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/app/lib/env';

interface PaginatedContent {
  pages: string[];
  total_pages: number;
}

interface CachedBookContent {
  content: PaginatedContent;
  timestamp: number;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MAX_STORAGE_SIZE = 2 * 1024 * 1024; // 2MB limit

export function useBookContent(bookId: string) {
  const [content, setContent] = useState<PaginatedContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Check cache first
        const cachedData = localStorage.getItem(`book-content-${bookId}`);
        if (cachedData) {
          const { content, timestamp }: CachedBookContent = JSON.parse(cachedData);
          const isExpired = Date.now() - timestamp > CACHE_DURATION;
          
          if (!isExpired) {
            console.log('Using cached content for book:', bookId);
            console.log('Cached content structure:', content);
            setContent(content);
            setIsLoading(false);
            return;
          }
        }

        // If not in cache or expired, fetch from API
        console.log('Fetching content for book:', bookId);
        const response = await fetch(`${API_BASE_URL}/books/${bookId}/content`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch book content: ${response.status}`);
        }
        
        const data = await response.json();
        
        
        // Validate the response structure
        if (!data || !Array.isArray(data.pages) || typeof data.total_pages !== 'number') {
          console.error('Invalid content structure:', data);
          throw new Error('Invalid content structure received from server');
        }
        
        // Ensure the content is properly formatted
        const bookContent: PaginatedContent = {
          pages: data.pages.map((page: string) => page.trim()),
          total_pages: data.total_pages
        };
        
        console.log('Processed book content:', {
          totalPages: bookContent.total_pages,
          pagesLength: bookContent.pages.length,
          firstPage: bookContent.pages[0]?.substring(0, 100) + '...'
        });
        
        // Check size before attempting to store
        const contentSize = new Blob([JSON.stringify(data)]).size;
        if (contentSize > MAX_STORAGE_SIZE) {
          console.warn(`Content size (${contentSize} bytes) exceeds storage limit (${MAX_STORAGE_SIZE} bytes). Skipping cache.`);
          setContent(bookContent);
          setIsLoading(false);
          return;
        }
        
        try {
          localStorage.setItem(`book-content-${bookId}`, JSON.stringify(data));
        } catch (storageError) {
          console.warn('Storage failed:', storageError);
          // Continue without caching
        }
        
        setContent(bookContent);
      } catch (err) {
        console.error('Error in useBookContent:', err);
        setError(err instanceof Error ? err.message : 'Failed to load book content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [bookId]);

  return { content, isLoading, error };
} 