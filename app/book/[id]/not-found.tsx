import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function BookNotFound() {
  return (
    <main className="container mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl font-serif-reading font-semibold mb-4">No book with that number</h1>
      <p className="text-muted-foreground mb-8">
        Project Gutenberg has no ebook under this ID. Ebook numbers are listed on each
        book&apos;s page at gutenberg.org.
      </p>
      <Button variant="outline" asChild>
        <Link href="/">Back to search</Link>
      </Button>
    </main>
  )
}
