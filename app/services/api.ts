const API_BASE_URL = 'https://dull-meggie-1omar-d9f030db.koyeb.app';

export interface BookDetails {
  id: string;
  title: string;
  author: string;
  original_publication: string;
  language: string;
  category: string;
  ebook_no: string;
  release_date: string;
  copyright_status: string;
  summary: string;
  cover_url: string | null;
}

export interface BookListResponse {
  books: BookDetails[];
  total: number;
  page: number;
  per_page: number;
}

export async function fetchBooks(page = 1, perPage = 10): Promise<BookListResponse> {
  const response = await fetch(`${API_BASE_URL}/books?page=${page}&per_page=${perPage}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch books: ${response.status}`);
  }
  
  return response.json();
}

export async function fetchBookById(id: string): Promise<BookDetails> {
  const response = await fetch(`${API_BASE_URL}/books/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch book: ${response.status}`);
  }
  
  return response.json();
}

export async function searchBooks(query: string): Promise<BookDetails[]> {
  const response = await fetch(`${API_BASE_URL}/books/search/${encodeURIComponent(query)}`);
  
  if (!response.ok) {
    throw new Error(`Failed to search books: ${response.status}`);
  }
  
  return response.json();
} 