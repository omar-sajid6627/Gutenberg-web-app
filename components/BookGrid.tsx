import { motion } from 'framer-motion';
import { BookCard } from './BookCard';
import { FeaturedBook } from '@/app/data/featured-books';

interface BookGridProps {
  books: FeaturedBook[];
}

export function BookGrid({ books }: BookGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map((book, index) => (
        <motion.div
          key={book.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <BookCard
            title={book.title}
            author={book.author}
            coverUrl={book.coverUrl}
            id={book.id}
          />
        </motion.div>
      ))}
    </div>
  );
} 