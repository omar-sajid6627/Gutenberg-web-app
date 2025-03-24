export interface Book {
  id: string;
  title: string;
  author: string;
  language: string;
  category: string;
  ebook_no: string;
  release_date: string;
  summary: string;
  cover_url: string | null;
  downloads: number;
  reading_ease_score: number | null;
  content?: string;
  total_pages?: number;
  book_types?: string[];
  keywords?: { [key: string]: string[] };
} 