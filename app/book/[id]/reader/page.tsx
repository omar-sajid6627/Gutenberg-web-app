"use client"

import { useEffect, useState } from "react"
import { BookReader } from "../read/BookReader"
import { BookChat } from "../../../components/BookChat"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

interface BookReaderProps {
  params: {
    id: string
  }
}

export default function BookReaderPage({ params }: BookReaderProps) {
  const [book, setBook] = useState<any>(null)

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(`/api/books/${params.id}`)
        const data = await response.json()
        setBook(data)
      } catch (error) {
        console.error("Error fetching book:", error)
      }
    }
    fetchBook()
  }, [params.id])

  if (!book) return null

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-b z-50">
        <div className="container flex items-center h-14 gap-4">
          <Link href={`/book/${params.id}`}>
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-medium truncate">{book.title}</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="container pt-20 pb-32">
        <BookReader book={book} />
      </main>

      {/* Chat component */}
      <BookChat 
        bookId={params.id} 
        bookTitle={book.title}
        className="fixed bottom-6 left-6 z-50" // Position chat on the left
      />
    </div>
  )
} 