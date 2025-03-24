"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, Send, X, Loader2, BookOpen } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface BookChatProps {
  bookId: string
  bookTitle: string
}

export function BookChat({ bookId, bookTitle }: BookChatProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [isChatOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch(`/api/books/${bookId}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          query: userMessage,
          book_id: bookId,
          temperature: 0
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to get response')
      }

      const data = await response.json()
      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: data.answer || "No response received" 
      }])
    } catch (error: any) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: `Error: ${error?.message || 'An error occurred'}. Please try again.`
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Chat Button */}
      <motion.div
        className="fixed bottom-6 left-6 z-50"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          transition: {
            type: "spring",
            stiffness: 200,
            damping: 15,
          },
        }}
        whileHover={{
          scale: [1, 1.05, 1],
          boxShadow: [
            "0 0 0 0 rgba(var(--primary), 0.7)",
            "0 0 0 10px rgba(var(--primary), 0)",
            "0 0 0 0 rgba(var(--primary), 0)",
          ],
          transition: {
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
          },
        }}
      >
        <Button
          onClick={() => setIsChatOpen(true)}
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg relative"
          size="icon"
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/30 blur-md"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 0.3, 0.7],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
          <MessageCircle className="h-6 w-6 relative z-10" />
        </Button>
      </motion.div>

      {/* Chat Container */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            className="fixed bottom-6 left-6 w-[350px] sm:w-[400px] h-[500px] bg-card rounded-2xl shadow-2xl border border-primary/20 overflow-hidden z-50 flex flex-col"
            initial={{ opacity: 0, scale: 0.9, y: 20, x: -20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              x: 0,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 25,
                duration: 0.3,
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              y: 20,
              x: -20,
              transition: { duration: 0.2 },
            }}
          >
            {/* Chat Header */}
            <div className="p-4 border-b bg-primary/5 backdrop-blur-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-medium text-sm">Book Assistant</h3>
                  <p className="text-xs text-muted-foreground truncate max-w-[250px]">{bookTitle}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-primary/10"
                onClick={() => setIsChatOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mb-4 text-primary/40" />
                  <h3 className="font-medium mb-2">Ask me about this book</h3>
                  <p className="text-sm">I can answer questions about the plot, characters, themes, and more.</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <motion.div
                    key={index}
                    custom={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: {
                        delay: index * 0.1,
                        duration: 0.3,
                      },
                    }}
                    className={cn(
                      "flex items-start gap-2 max-w-[90%]",
                      message.role === "user" ? "ml-auto" : "mr-auto",
                    )}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8 bg-primary/10">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2 text-sm",
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                      )}
                    >
                      {message.content}
                    </div>
                    {message.role === "user" && (
                      <Avatar className="h-8 w-8 bg-primary/80">
                        <div className="text-xs font-medium text-primary-foreground">You</div>
                      </Avatar>
                    )}
                  </motion.div>
                ))
              )}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-2 max-w-[90%]"
                >
                  <Avatar className="h-8 w-8 bg-primary/10">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </Avatar>
                  <div className="rounded-2xl px-4 py-2 text-sm bg-muted flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t bg-card/80 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about this book..."
                  className="flex-1 bg-background/50"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || !input.trim()}
                  className="h-10 w-10 rounded-full"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 