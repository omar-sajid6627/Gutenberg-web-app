import Link from 'next/link';
import { DarkModeToggle } from '@/components/DarkModeToggle';

export function SiteHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        <Link href="/" className="font-serif text-xl font-semibold tracking-tight">
          Gutenberg <span className="text-primary">Explorer</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {children}
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
}
