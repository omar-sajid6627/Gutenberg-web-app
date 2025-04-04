"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, Send, X, Loader2, BookOpen, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface BookChatProps {
  bookId: string
  bookTitle: string
  className?: string
}

export function BookChat({ bookId, bookTitle, className }: BookChatProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)
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

  // Effect to handle timeout for loading state
  useEffect(() => {
    // Clean up timeout when component unmounts
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [timeoutId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    // Set a timeout to recover from stuck loading state
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('Response timeout - resetting loading state')
        setIsLoading(false)
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I'm having trouble connecting to the server. Please try again in a moment.",
          },
        ])
      }
    }, 15000) // 15 second timeout
    
    setTimeoutId(timeout)

    try {
      // Try the API route first
      let response = await fetch(`/api/books/${bookId}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: userMessage,
          book_id: bookId,
          temperature: 0,
        }),
      })

      // If the response is not ok, try the direct API call
      if (!response.ok) {
        console.warn("API route failed, trying direct backend access");
        
        // Fallback to direct backend call
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dull-meggie-1omar-d9f030db.koyeb.app';
        response = await fetch(`${backendUrl}/books/${bookId}/ask`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            book_id: bookId,
            query: userMessage,
            temperature: 0,
          }),
        });
      }

      // Clear the timeout since we got a response
      if (timeoutId) {
        clearTimeout(timeoutId)
        setTimeoutId(null)
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || "Failed to get response")
      }

      const data = await response.json()
      console.log("LLM response received:", data)
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer || data.response || "No response received",
        },
      ])
    } catch (error: any) {
      console.error("Chat error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${error?.message || "An error occurred"}. Please try again.`,
        },
      ])
    } finally {
      // Clear any pending timeouts
      if (timeoutId) {
        clearTimeout(timeoutId)
        setTimeoutId(null)
      }
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Talk to the book box */}
      <motion.div
        className={cn("fixed left-6 bottom-6 z-50", isChatOpen ? "opacity-0 pointer-events-none" : "opacity-100")}
        initial={{ opacity: 0, x: -20 }}
        animate={{
          opacity: isChatOpen ? 0 : 1,
          x: isChatOpen ? -20 : 0,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 25,
          },
        }}
        whileHover={{
          scale: 1.05,
          boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)",
          transition: { duration: 0.3 },
        }}
        onClick={() => setIsChatOpen(true)}
      >
        <div className="relative w-64 h-24 cursor-pointer group">
          {/* Animated glow effect */}
          <div className="absolute -inset-0.5 rounded-xl opacity-75 group-hover:opacity-100 blur-sm group-hover:blur-md bg-glow-animation"></div>

          {/* Black background with subtle gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-black to-gray-900 rounded-lg"></div>

          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 rounded-lg opacity-10 pattern-dots"></div>

          {/* Content */}
          <div className="relative flex items-center justify-between p-4 h-full">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles className="h-4 w-4 text-amber-300" />
                <h3 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 text-lg tracking-tight">
                  Talk to book
                </h3>
              </div>
              <p className="text-blue-100/80 text-xs">
                Ask me anything about <span className="italic font-medium text-blue-200">"{bookTitle}"</span>
              </p>

              {/* Animated arrow */}
              <motion.div
                className="absolute bottom-3 right-4 text-white/80"
                animate={{
                  x: [0, 5, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              >
                <div className="flex items-center gap-1 text-xs font-medium">
                  <span>Chat now</span>
                  <span>→</span>
                </div>
              </motion.div>
            </div>

            {/* Glowing icon */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-2.5 rounded-full shadow-lg relative">
              <div className="absolute inset-0 rounded-full animate-pulse-slow bg-blue-400/20 blur-sm"></div>
              <MessageCircle className="h-5 w-5 text-white relative z-10" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chat Button (original) */}
      <motion.div
        className={cn("z-50", className, isChatOpen ? "opacity-100" : "opacity-0 pointer-events-none")}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: isChatOpen ? 1 : 0,
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
            className={cn(
              "w-[350px] sm:w-[400px] h-[500px] bg-card rounded-2xl shadow-2xl border border-primary/20 overflow-hidden z-50 flex flex-col",
              className ? "fixed bottom-20" : "fixed bottom-6 left-6",
            )}
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
                      "flex items-start gap-3",
                      message.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto flex-row",
                    )}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8 bg-primary/10 flex-shrink-0 flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2 text-sm max-w-[85%]",
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                      )}
                    >
                      {message.content}
                    </div>
                    {message.role === "user" && (
                      <Avatar className="h-8 w-8 bg-primary/80 flex-shrink-0 flex items-center justify-center">
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

