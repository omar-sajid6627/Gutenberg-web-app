import { BookCard } from './BookCard';
import type { RecentBook } from '@/lib/recent-books';

export function BookGrid({ books }: { books: RecentBook[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
      {books.map((book) => (
        <li key={book.id}>
          <BookCard {...book} />
        </li>
      ))}
    </ul>
  );
}
