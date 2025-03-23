"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { SearchBar } from "@/components/SearchBar"
import { SiteHeader } from "@/components/SiteHeader"
import { BookGrid } from "@/components/BookGrid"
import { loadRecentBooks, type RecentBook } from "@/lib/recent-books"

const STARTING_POINTS = [
  { id: "1342", title: "Pride and Prejudice" },
  { id: "84", title: "Frankenstein" },
  { id: "11", title: "Alice’s Adventures in Wonderland" },
  { id: "2701", title: "Moby Dick" },
]

export default function Home() {
  const [recentBooks, setRecentBooks] = useState<RecentBook[] | null>(null)

  useEffect(() => setRecentBooks(loadRecentBooks()), [])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main id="main" className="container mx-auto flex-1 px-4 pb-20">
        <section className="grid gap-10 py-12 md:grid-cols-[1.2fr_1fr] md:items-end md:py-20">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
              Project Gutenberg, read closely
            </p>
            <h1 className="font-serif text-4xl font-semibold leading-tight md:text-5xl">
              Open any public-domain book in Project Gutenberg by its number.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Read it page by page, ask questions answered from its own text, and see its Flesch
              reading ease, tone and most frequent words.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <SearchBar />
            <p className="mt-2 text-sm text-muted-foreground">Or start with</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {STARTING_POINTS.map((book) => (
                <li key={book.id}>
                  <Link
                    href={`/book/${book.id}`}
                    className="inline-block rounded-full border px-3 py-1 text-sm transition-colors hover:border-primary hover:text-primary"
                  >
                    {book.title} <span className="text-muted-foreground">#{book.id}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="recent-heading" className="border-t pt-10">
          <h2 id="recent-heading" className="mb-6 font-serif text-2xl font-semibold">
            Your shelf
          </h2>
          {recentBooks === null ? null : recentBooks.length > 0 ? (
            <BookGrid books={recentBooks} />
          ) : (
            <p className="max-w-md text-muted-foreground">
              Books you open appear here, newest first. Nothing is stored beyond this browser.
            </p>
          )}
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-sm text-muted-foreground">
          Texts and metadata come from Project Gutenberg. The books are in the public domain in the
          United States.
        </div>
      </footer>
    </div>
  )
}
