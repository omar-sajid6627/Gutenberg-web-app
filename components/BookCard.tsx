"use client"

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';

interface BookCardProps {
  title: string;
  author: string;
  coverUrl: string | null;
  id: string;
}

export function BookCard({ title, author, coverUrl, id }: BookCardProps) {
  return (
    <Link href={`/book/${id}`}>
      <div className="group relative overflow-hidden rounded-lg border bg-background p-2 hover:shadow-lg transition-shadow">
        <div className="aspect-[2/3] relative overflow-hidden rounded-md bg-muted">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-muted-foreground">No cover</span>
            </div>
          )}
        </div>
        <div className="mt-4 space-y-1">
          <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground">{author}</p>
        </div>
      </div>
    </Link>
  );
}