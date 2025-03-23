"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, BookOpen, ChevronDown, Download, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BookCover } from "@/components/BookCover"
import { ReadingEase } from "@/components/ReadingEase"
import { SiteHeader } from "@/components/SiteHeader"
import { BookChat } from "@/app/components/BookChat"
import { SentimentOverview, WordCloudPanel } from "@/app/components/sentimentAnalysis"
import { useSentiment } from "@/app/hooks/useSentiment"
import type { BookView } from "@/lib/books"
import { displayAuthor, rememberBook } from "@/lib/recent-books"

const SUMMARY_PREVIEW_CHARS = 420

function downloadLinks(ebookNo: string) {
  const base = "https://www.gutenberg.org"
  return [
    { label: "EPUB", href: `${base}/ebooks/${ebookNo}.epub3.images` },
    { label: "Kindle", href: `${base}/ebooks/${ebookNo}.kf8.images` },
    { label: "HTML", href: `${base}/ebooks/${ebookNo}.html.images` },
    { label: "Plain text", href: `${base}/ebooks/${ebookNo}.txt.utf-8` },
    { label: "All formats", href: `${base}/ebooks/${ebookNo}` },
  ]
}

type SummaryState =
  | { kind: "given"; text: string }
  | { kind: "generating" }
  | { kind: "generated"; text: string }
  | { kind: "failed" }

/** The catalogue summary, or one generated from the text when there is none. */
function useSummary(bookId: string, catalogueSummary: string) {
  const [state, setState] = useState<SummaryState>(
    catalogueSummary ? { kind: "given", text: catalogueSummary } : { kind: "generating" },
  )

  const generate = useCallback(async () => {
    setState({ kind: "generating" })
    try {
      const response = await fetch(`/api/books/${encodeURIComponent(bookId)}/generate-summary`, { method: "POST" })
      const data = await response.json()
      if (!response.ok || typeof data.summary !== "string") throw new Error(data.error)
      setState({ kind: "generated", text: data.summary })
    } catch {
      setState({ kind: "failed" })
    }
  }, [bookId])

  useEffect(() => {
    if (!catalogueSummary) generate()
  }, [catalogueSummary, generate])

  return { state, retry: generate }
}

function Summary({ bookId, text }: { bookId: string; text: string }) {
  const { state, retry } = useSummary(bookId, text)
  const [expanded, setExpanded] = useState(false)

  if (state.kind === "generating") {
    return (
      <p className="flex items-center gap-2 text-muted-foreground" role="status">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Writing a summary from the text…
      </p>
    )
  }
  if (state.kind === "failed") {
    return (
      <div className="space-y-3" role="alert">
        <p className="text-muted-foreground">The catalogue has no summary and one could not be generated.</p>
        <Button variant="outline" size="sm" onClick={retry} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Try again
        </Button>
      </div>
    )
  }

  const long = state.text.length > SUMMARY_PREVIEW_CHARS
  const shown = long && !expanded ? `${state.text.slice(0, state.text.lastIndexOf(" ", SUMMARY_PREVIEW_CHARS))}…` : state.text

  return (
    <div className="space-y-2">
      <p className="whitespace-pre-line text-lg leading-relaxed">{shown}</p>
      {long && (
        <Button variant="link" className="h-auto px-0" onClick={() => setExpanded((open) => !open)} aria-expanded={expanded}>
          {expanded ? "Show less" : "Show the full summary"}
        </Button>
      )}
      {state.kind === "generated" && (
        <p className="text-xs text-muted-foreground">Generated from the book’s text; it may miss or misstate details.</p>
      )}
    </div>
  )
}

export function BookDetails({ book }: { book: BookView }) {
  const sentiment = useSentiment(book.id)

  useEffect(() => {
    rememberBook({ id: book.id, title: book.title, author: book.author, coverUrl: book.coverUrl })
  }, [book.id, book.title, book.author, book.coverUrl])

  const facts = [
    { term: "Ebook number", value: book.ebookNo },
    { term: "Language", value: book.language },
    { term: "Released", value: book.releaseDate },
    { term: "Downloads, last 30 days", value: book.downloads.toLocaleString("en") },
  ]

  return (
    <div className="min-h-screen pb-28">
      <SiteHeader />

      <main id="main" className="container mx-auto px-4 pt-6">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" aria-hidden /> All books
        </Link>

        <div className="mt-6 grid gap-10 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]">
          <aside className="space-y-6">
            <BookCover
              id={book.id}
              title={book.title}
              author={book.author}
              coverUrl={book.coverUrl}
              priority
              className="mx-auto w-48 md:w-full"
            />
            <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
              <Button asChild size="lg" className="gap-2">
                <Link href={`/book/${book.id}/read`}>
                  <BookOpen className="h-4 w-4" aria-hidden /> Read the book
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="lg" className="gap-2">
                    <Download className="h-4 w-4" aria-hidden /> Download
                    <ChevronDown className="h-4 w-4" aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {downloadLinks(book.ebookNo).map((link) => (
                    <DropdownMenuItem key={link.label} asChild>
                      <a href={link.href} target="_blank" rel="noopener noreferrer">
                        {link.label}
                      </a>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </aside>

          <div className="min-w-0 space-y-8">
            <header>
              <h1 className="font-serif text-3xl font-semibold leading-tight md:text-4xl">{book.title}</h1>
              <p className="mt-2 text-xl text-muted-foreground">{displayAuthor(book.author)}</p>
            </header>

            <section aria-labelledby="summary-heading">
              <h2 id="summary-heading" className="sr-only">
                Summary
              </h2>
              <Summary bookId={book.id} text={book.summary} />
            </section>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-y py-5 sm:grid-cols-4">
              {facts.map((fact) => (
                <div key={fact.term}>
                  <dt className="text-sm text-muted-foreground">{fact.term}</dt>
                  <dd className="font-medium">{fact.value}</dd>
                </div>
              ))}
            </dl>

            <div className="grid gap-6 xl:grid-cols-2">
              <ReadingEase score={book.readingEaseScore} />
              <SentimentOverview state={sentiment.state} onRetry={sentiment.reload} />
            </div>

            <WordCloudPanel state={sentiment.state} onRetry={sentiment.reload} />

            {book.bookTypes.length > 0 && (
              <section aria-labelledby="subjects-heading">
                <h2 id="subjects-heading" className="mb-4 font-serif text-xl font-semibold">
                  Subjects
                </h2>
                <div className="space-y-4">
                  {book.bookTypes.map((type) => (
                    <div key={type}>
                      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">{type}</h3>
                      <ul className="flex flex-wrap gap-2">
                        {book.keywords[type]?.map((keyword) => (
                          <li key={keyword} className="rounded-full bg-muted px-3 py-1 text-sm">
                            {keyword}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <BookChat bookId={book.id} bookTitle={book.title} className="fixed bottom-6 right-6" />
    </div>
  )
}
