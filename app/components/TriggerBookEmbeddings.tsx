"use client"

import { useEffect } from "react"

// Define API_BASE_URL directly
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dull-meggie-1omar-d9f030db.koyeb.app';

interface Book {
  id: string
}

interface TriggerBookEmbeddingsProps {
  book: Book
}

export function TriggerBookEmbeddings({ book }: TriggerBookEmbeddingsProps) {
  useEffect(() => {
    const generateEmbeddings = async () => {
      if (!book?.id) return // Prevent running if book ID is not available

      try {
        await fetch(`${API_BASE_URL}/books/${book.id}/generate-embeddings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })

        console.log(`✅ Triggered embedding generation for book ${book.id}`)
      } catch (error) {
        console.error(`❌ Error triggering embeddings for book ${book.id}:`, error)
      }
    }

    generateEmbeddings()
  }, [book?.id]) // Runs only when `book.id` changes

  return null // This component does not render anything
} 