import Image from 'next/image';
import { coverHue, displayAuthor } from '@/lib/recent-books';

/** "Frankenstein; Or, The Modern Prometheus" -> "Frankenstein", as on a spine. */
function mainTitle(title: string): string {
  return title.split(/[;:]/)[0].trim();
}
import { cn } from '@/lib/utils';

interface BookCoverProps {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  className?: string;
  priority?: boolean;
}

/** The book's cover image, or a typeset cloth cover when there is none. */
export function BookCover({ id, title, author, coverUrl, className, priority }: BookCoverProps) {
  if (coverUrl) {
    return (
      <div className={cn('relative aspect-[2/3] overflow-hidden rounded-sm bg-muted shadow-md', className)}>
        <Image
          src={coverUrl}
          alt={`Cover of ${title}`}
          fill
          priority={priority}
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 320px"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'typeset-cover flex aspect-[2/3] flex-col justify-between rounded-sm p-[8%] shadow-md',
        className,
      )}
      style={{ ['--cover-hue' as string]: coverHue(id) }}
      role="img"
      aria-label={`${title} by ${displayAuthor(author)}`}
    >
      <span className="border-b border-white/30 pb-2 font-serif line-clamp-4 text-[clamp(1rem,1.9vw,1.6rem)] font-semibold leading-tight">
        {mainTitle(title)}
      </span>
      <span className="font-serif text-[clamp(0.7rem,1.3vw,0.95rem)] italic opacity-90">{displayAuthor(author)}</span>
    </div>
  );
}
