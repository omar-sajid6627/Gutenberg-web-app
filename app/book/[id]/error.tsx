"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/SiteHeader"

export default function BookError({ reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="container mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-3xl font-serif font-semibold mb-4">This book could not be loaded</h1>
        <p className="text-muted-foreground mb-8">
          The book service did not answer. It may still be starting, or it may be unreachable
          from this server.
        </p>
        <div className="flex justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to search</Link>
          </Button>
        </div>
      </main>
    </>
  )
}
