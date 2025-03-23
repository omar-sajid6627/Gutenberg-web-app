import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { BookDetails } from "./BookDetails"
import { serverApiUrl } from "@/lib/api"
import { toBookView, type ApiBook } from "@/lib/books"

export const dynamic = "force-dynamic"

async function fetchBook(id: string): Promise<ApiBook> {
  const response = await fetch(serverApiUrl(`/books/${encodeURIComponent(id)}`), {
    next: { revalidate: 3600 },
  })
  if (response.status === 404) notFound()
  if (!response.ok) {
    // Rendered by error.tsx. This page used to return a hardcoded book
    // ("Two secrets and A man of his word") for any ID whenever the API
    // failed, so an outage looked like a real, wrong result.
    throw new Error(`The book service answered ${response.status} for book ${id}`)
  }
  return response.json()
}

/**
 * Flesch Reading Ease for this book, or null when it cannot be measured.
 * null is rendered as "not measured"; it is never filled in.
 */
async function fetchReadability(id: string): Promise<number | null> {
  try {
    const res = await fetch(serverApiUrl(`/books/${encodeURIComponent(id)}/readability`), {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const data = await res.json()
    return typeof data?.reading_ease_score === "number" ? data.reading_ease_score : null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const book = await fetchBook(params.id)
  return {
    title: `${book.title} · Gutenberg Explorer`,
    description: `${book.title} by ${book.author}, from Project Gutenberg`,
  }
}

export default async function BookPage({ params }: { params: { id: string } }) {
  const [book, readingEaseScore] = await Promise.all([
    fetchBook(params.id),
    fetchReadability(params.id),
  ])

  return <BookDetails book={toBookView(book, readingEaseScore)} />
}
