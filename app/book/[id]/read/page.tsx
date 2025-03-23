import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { BookReader } from "./BookReader"
import { serverApiUrl } from "@/lib/api"
import type { ApiBook } from "@/lib/books"

export const dynamic = "force-dynamic"

async function fetchBook(id: string): Promise<ApiBook> {
  const response = await fetch(serverApiUrl(`/books/${encodeURIComponent(id)}`), {
    next: { revalidate: 3600 },
  })
  if (response.status === 404) notFound()
  if (!response.ok) throw new Error(`The book service answered ${response.status} for book ${id}`)
  return response.json()
}

/** The book's text as pages, or an empty list when the backend has none. */
async function fetchPages(id: string): Promise<string[]> {
  const response = await fetch(serverApiUrl(`/books/${encodeURIComponent(id)}/content`), {
    next: { revalidate: 3600 },
  })
  if (!response.ok) return []
  const data = await response.json()
  return Array.isArray(data?.pages) ? data.pages.filter((p: unknown) => typeof p === "string") : []
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const book = await fetchBook(params.id)
  return { title: `Reading ${book.title} · Gutenberg Explorer` }
}

export default async function ReadBookPage({ params }: { params: { id: string } }) {
  const [book, pages] = await Promise.all([fetchBook(params.id), fetchPages(params.id)])

  return (
    <BookReader
      book={{ id: book.id, title: book.title, author: book.author, ebookNo: book.ebook_no }}
      pages={pages}
    />
  )
}
