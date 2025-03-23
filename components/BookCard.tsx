import Link from 'next/link';
import { BookCover } from '@/components/BookCover';
import { displayAuthor, type RecentBook } from '@/lib/recent-books';

export function BookCard({ id, title, author, coverUrl }: RecentBook) {
  return (
    <Link href={`/book/${id}`} className="group block rounded-md focus-visible:ring-2 focus-visible:ring-ring">
      <BookCover
        id={id}
        title={title}
        author={author}
        coverUrl={coverUrl}
        className="transition-transform duration-200 group-hover:-translate-y-1"
      />
      <p className="mt-3 line-clamp-2 font-serif font-semibold leading-snug group-hover:text-primary">{title}</p>
      <p className="text-sm text-muted-foreground">{displayAuthor(author)}</p>
    </Link>
  );
}
