"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { BookOpen, Loader2, MessageCircle, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/** The first question on a book also indexes its text, which is slow. */
export const ASK_TIMEOUT_MS = 60_000

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  failed?: boolean
}

interface BookChatProps {
  bookId: string
  bookTitle: string
  /** Positioning for the launcher and panel; defaults to the bottom-left corner. */
  className?: string
}

export async function askBook(bookId: string, query: string, signal: AbortSignal): Promise<string> {
  const response = await fetch(`/api/books/${encodeURIComponent(bookId)}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    signal,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || typeof data.answer !== "string") {
    throw new Error(data.error || `The book service answered ${response.status}`)
  }
  return data.answer
}

export function BookChat({ bookId, bookTitle, className = "fixed bottom-6 left-6" }: BookChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const requestRef = useRef<AbortController | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  useEffect(() => () => requestRef.current?.abort(), [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const question = input.trim()
    if (!question || isLoading) return

    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: question }])
    setIsLoading(true)

    const controller = new AbortController()
    requestRef.current = controller
    // Without a deadline a hung backend left "Thinking…" up forever; the
    // previous timer read isLoading from a stale closure and never fired.
    const timer = setTimeout(() => controller.abort(), ASK_TIMEOUT_MS)

    try {
      const answer = await askBook(bookId, question, controller.signal)
      setMessages((prev) => [...prev, { role: "assistant", content: answer }])
    } catch (error) {
      const message = controller.signal.aborted
        ? "No answer within a minute. The service may still be indexing this book; try again shortly."
        : error instanceof Error
          ? error.message
          : "Something went wrong"
      setMessages((prev) => [...prev, { role: "assistant", content: message, failed: true }])
    } finally {
      clearTimeout(timer)
      requestRef.current = null
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("z-50", className)}>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 rounded-full border border-primary/30 bg-primary px-5 py-3 text-primary-foreground shadow-lg transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-haspopup="dialog"
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          <span className="text-sm font-medium">Ask about this book</span>
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-label={`Questions about ${bookTitle}`}
            className="flex h-[min(520px,75vh)] w-[min(400px,calc(100vw-3rem))] flex-col overflow-hidden rounded-xl border bg-card shadow-2xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between border-b bg-muted/50 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <BookOpen className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div className="min-w-0">
                  <p className="text-sm font-medium">Ask the book</p>
                  <p className="truncate text-xs text-muted-foreground">{bookTitle}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)} aria-label="Close questions">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center p-4 text-center text-muted-foreground">
                  <p className="mb-2 font-medium text-foreground">Ask about plot, characters or themes</p>
                  <p className="text-sm">Answers come from the book’s own text.</p>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-lg px-4 py-2 text-sm",
                    message.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "mr-auto bg-muted",
                    message.failed && "border border-destructive/40",
                  )}
                >
                  <span className="sr-only">{message.role === "user" ? "You: " : "Answer: "}</span>
                  {message.content}
                </div>
              ))}
              {isLoading && (
                <div className="mr-auto flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm" role="status">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Looking through the text…
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t p-4">
              <label htmlFor={`ask-${bookId}`} className="sr-only">
                Your question
              </label>
              <Input
                id={`ask-${bookId}`}
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Who is the narrator?"
                disabled={isLoading}
                autoComplete="off"
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()} aria-label="Send question">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
