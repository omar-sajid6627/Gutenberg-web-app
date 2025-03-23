import { useCallback, useEffect, useState } from "react"

export interface SentimentResult {
  sentiment: {
    positive: number
    neutral: number
    negative: number
    overall: string
    compound: number
  }
  /** "processing" while the backend analyses the text in the background. */
  status?: string
  wordcloud_data?: { words: Array<{ text: string; value: number }> }
}

export type SentimentState =
  | { kind: "loading" }
  | { kind: "processing" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: SentimentResult }

/**
 * Sentiment and word frequencies for one book, requested once per page.
 *
 * The detail page used to mount three SentimentAnalysis components that each
 * POSTed to the endpoint, and every uncached POST starts a fresh background
 * analysis of the whole novel on the backend. While the backend is still
 * processing it returns a neutral placeholder, which is not a result and is
 * reported as "processing" rather than displayed as a neutral score.
 */
export function useSentiment(bookId: string) {
  const [state, setState] = useState<SentimentState>({ kind: "loading" })

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setState({ kind: "loading" })
      try {
        const response = await fetch(`/api/books/${encodeURIComponent(bookId)}/sentiment`, {
          method: "POST",
          signal,
        })
        if (!response.ok) throw new Error(`The analysis service answered ${response.status}`)
        const data: SentimentResult = await response.json()
        setState(data.status === "processing" ? { kind: "processing" } : { kind: "ready", data })
      } catch (error) {
        if (signal?.aborted) return
        setState({ kind: "error", message: error instanceof Error ? error.message : "Analysis failed" })
      }
    },
    [bookId],
  )

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  return { state, reload: () => load() }
}
