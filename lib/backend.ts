import { NextResponse } from "next/server"
import { serverApiUrl } from "@/lib/api"

/**
 * The backend's /ask has answered as `{ response }`, `{ answer }` and as a
 * bare string over its lifetime. Anything else is not an answer, and is
 * reported as an error rather than shown to the reader as raw JSON.
 */
export function extractAnswer(data: unknown): string | null {
  if (typeof data === "string") return data.trim() || null
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>
    for (const key of ["response", "answer"]) {
      const value = record[key]
      if (typeof value === "string" && value.trim()) return value
    }
  }
  return null
}

function unreachable() {
  return NextResponse.json({ error: "The book service is unreachable" }, { status: 502 })
}

async function backendError(response: Response) {
  const details = (await response.text()).slice(0, 500)
  return NextResponse.json({ error: "The book service could not answer", details }, { status: response.status })
}

/** Forward a question about a book to the backend and return `{ [field]: answer }`. */
export async function forwardQuestion(
  bookId: string,
  query: string,
  temperature: number,
  field: "answer" | "summary",
) {
  let response: Response
  try {
    response = await fetch(serverApiUrl(`/books/${encodeURIComponent(bookId)}/ask`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ book_id: bookId, query, temperature }),
      cache: "no-store",
    })
  } catch {
    return unreachable()
  }
  if (!response.ok) return backendError(response)

  const answer = extractAnswer(await response.json())
  if (!answer) {
    return NextResponse.json({ error: "The book service returned no answer" }, { status: 502 })
  }
  return NextResponse.json({ [field]: answer })
}

export async function forwardSentiment(bookId: string) {
  let response: Response
  try {
    response = await fetch(serverApiUrl(`/books/${encodeURIComponent(bookId)}/sentiment`), {
      method: "POST",
      cache: "no-store",
    })
  } catch {
    return unreachable()
  }
  if (!response.ok) return backendError(response)
  return NextResponse.json(await response.json())
}
