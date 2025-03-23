"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ChevronLeft, ChevronRight, Minus, Pause, Plus, Type, Volume2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { BookChat } from "@/app/components/BookChat"
import { MarkdownRenderer, detectContentFormat } from "@/app/components/MarkdownRenderer"
import { apiUrl } from "@/lib/api"

interface BookReaderProps {
  book: { id: string; title: string; author: string; ebookNo: string }
  pages: string[]
}

/** Plain text for speech: Gutenberg marks italics with underscores. */
function speakableText(page: string): string {
  return page.replace(/_/g, " ").replace(/\s+/g, " ").trim()
}

export function BookReader({ book, pages }: BookReaderProps) {
  const [pageIndex, setPageIndex] = useState(0)
  const [fontSize, setFontSize] = useState(18)
  const [lineHeight, setLineHeight] = useState(1.8)
  const [showSettings, setShowSettings] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechError, setSpeechError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  // Kept in refs, not state: the audio callbacks run long after the render
  // that created them, and used to read stale chunk lists from state.
  const chunksRef = useRef<string[]>([])
  const chunkIndexRef = useRef(0)
  const audioUrlsRef = useRef(new Map<number, string>())

  const totalPages = pages.length
  const pageContent = pages[pageIndex] ?? ""

  const resetSpeech = () => {
    audioRef.current?.pause()
    audioUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    audioUrlsRef.current.clear()
    chunksRef.current = []
    chunkIndexRef.current = 0
    setIsSpeaking(false)
  }

  useEffect(() => {
    const audioUrls = audioUrlsRef.current
    return () => audioUrls.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  const loadChunkAudio = async (index: number): Promise<string> => {
    const cached = audioUrlsRef.current.get(index)
    if (cached) return cached

    const response = await fetch(apiUrl("/tts"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: chunksRef.current[index],
        chunk_index: index,
        total_chunks: chunksRef.current.length,
      }),
    })
    if (!response.ok) throw new Error(`The speech service answered ${response.status}`)

    const url = URL.createObjectURL(await response.blob())
    audioUrlsRef.current.set(index, url)
    return url
  }

  const playChunk = async (index: number) => {
    const audio = audioRef.current
    if (!audio) return
    chunkIndexRef.current = index
    audio.src = await loadChunkAudio(index)
    await audio.play()

    const next = index + 1
    if (next < chunksRef.current.length) {
      // Prefetch only; a failure here is retried when the chunk is reached.
      loadChunkAudio(next).catch(() => undefined)
    }
  }

  const toggleSpeech = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (isSpeaking) {
      audio.pause()
      setIsSpeaking(false)
      return
    }

    setSpeechError(null)
    setIsSpeaking(true)
    try {
      if (chunksRef.current.length > 0 && audio.src) {
        await audio.play()
        return
      }
      const response = await fetch(apiUrl("/tts/chunks"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: speakableText(pageContent) }),
      })
      if (!response.ok) throw new Error(`The speech service answered ${response.status}`)
      const { chunks } = (await response.json()) as { chunks: string[] }
      chunksRef.current = chunks
      await playChunk(0)
    } catch (error) {
      resetSpeech()
      setSpeechError(error instanceof Error ? error.message : "Read-aloud failed")
    }
  }

  const handleAudioEnded = () => {
    const next = chunkIndexRef.current + 1
    if (next < chunksRef.current.length) {
      playChunk(next).catch((error) => {
        resetSpeech()
        setSpeechError(error instanceof Error ? error.message : "Read-aloud failed")
      })
    } else {
      resetSpeech()
    }
  }

  const goToPage = (index: number) => {
    if (index < 0 || index >= totalPages) return
    resetSpeech()
    setPageIndex(index)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="container flex h-16 items-center justify-between gap-2 px-4">
          <div className="flex min-w-0 items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/book/${book.id}`} aria-label={`Back to ${book.title}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="min-w-0">
              <h1 className="truncate font-serif-reading text-lg font-semibold">{book.title}</h1>
              <p className="truncate text-sm text-muted-foreground">{book.author}</p>
            </div>
          </div>
          {totalPages > 0 && (
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant={isSpeaking ? "default" : "ghost"}
                size="icon"
                onClick={toggleSpeech}
                aria-pressed={isSpeaking}
                aria-label={isSpeaking ? "Pause reading aloud" : "Read this page aloud"}
              >
                {isSpeaking ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings((open) => !open)}
                aria-expanded={showSettings}
                aria-controls="reading-settings"
                aria-label="Reading preferences"
              >
                <Type className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </header>

      <AnimatePresence>
        {showSettings && (
          <motion.section
            id="reading-settings"
            aria-label="Reading preferences"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed right-4 top-16 z-40 w-64 rounded-lg border bg-card p-4 shadow-lg"
          >
            <h2 className="mb-3 font-medium">Reading preferences</h2>
            <Stepper
              label="Font size"
              value={`${fontSize}px`}
              onDecrease={() => setFontSize((size) => Math.max(size - 1, 14))}
              onIncrease={() => setFontSize((size) => Math.min(size + 1, 26))}
            />
            <Stepper
              label="Line spacing"
              value={lineHeight.toFixed(1)}
              onDecrease={() => setLineHeight((h) => Math.max(+(h - 0.1).toFixed(1), 1.2))}
              onIncrease={() => setLineHeight((h) => Math.min(+(h + 0.1).toFixed(1), 2.5))}
            />
          </motion.section>
        )}
      </AnimatePresence>

      <audio ref={audioRef} onEnded={handleAudioEnded} onError={resetSpeech} />

      <main className="container mx-auto px-4 pb-32 pt-8">
        {speechError && (
          <p role="alert" className="mx-auto mb-6 max-w-prose rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
            Read-aloud is unavailable: {speechError}
          </p>
        )}

        {totalPages === 0 ? (
          <div className="mx-auto max-w-prose py-16 text-center">
            <h2 className="mb-3 font-serif-reading text-2xl font-semibold">The text is not available here</h2>
            <p className="mb-6 text-muted-foreground">
              The book service could not provide this book&apos;s text. Project Gutenberg itself
              offers it in several formats.
            </p>
            <Button asChild variant="outline">
              <a href={`https://www.gutenberg.org/ebooks/${book.ebookNo}`} target="_blank" rel="noopener noreferrer">
                Open on gutenberg.org
              </a>
            </Button>
          </div>
        ) : (
          <MarkdownRenderer
            content={pageContent}
            format={detectContentFormat(pageContent)}
            fontSize={fontSize}
            lineHeight={lineHeight}
            className="reader-content"
          />
        )}
      </main>

      <BookChat bookId={book.id} bookTitle={book.title} className="fixed bottom-24 left-6 z-50" />

      {totalPages > 0 && (
        <nav
          aria-label="Pages"
          className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70"
        >
          <div className="container mx-auto flex items-center justify-between px-4 py-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Page {pageIndex + 1} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(pageIndex - 1)}
                disabled={pageIndex === 0}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(pageIndex + 1)}
                disabled={pageIndex >= totalPages - 1}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </nav>
      )}
    </div>
  )
}

function Stepper({
  label,
  value,
  onDecrease,
  onIncrease,
}: {
  label: string
  value: string
  onDecrease: () => void
  onIncrease: () => void
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={onDecrease} aria-label={`Decrease ${label.toLowerCase()}`}>
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-10 text-center text-xs tabular-nums" aria-live="polite">{value}</span>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={onIncrease} aria-label={`Increase ${label.toLowerCase()}`}>
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
