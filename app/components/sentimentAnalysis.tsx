"use client"

import dynamic from "next/dynamic"
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import type { SentimentState } from "@/app/hooks/useSentiment"

const ReactWordcloud = dynamic(() => import("react-wordcloud"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-muted-foreground">Drawing word cloud…</div>,
})

const wordcloudOptions = {
  rotations: 2,
  rotationAngles: [-90, 0] as [number, number],
  fontSizes: [14, 56] as [number, number],
  padding: 2,
  fontFamily: "var(--font-serif), Georgia, serif",
  colors: ["#8a3b12", "#1f5e5b", "#6b5a2e", "#a0522d", "#3c4a3e"],
  enableTooltip: true,
}

interface PanelProps {
  state: SentimentState
  onRetry: () => void
}

function PanelStatus({ state, onRetry }: PanelProps) {
  if (state.kind === "loading") {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-muted-foreground" role="status">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
        <p>Reading the book…</p>
      </div>
    )
  }
  if (state.kind === "processing") {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center text-muted-foreground" role="status">
        <p>The analysis is running on the whole text. It takes about a minute for a novel.</p>
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          Check again
        </Button>
      </div>
    )
  }
  if (state.kind === "error") {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center" role="alert">
        <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden />
        <p className="text-muted-foreground">{state.message}</p>
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          Retry analysis
        </Button>
      </div>
    )
  }
  return null
}

export function SentimentOverview({ state, onRetry }: PanelProps) {
  return (
    <section aria-labelledby="sentiment-heading" className="rounded-lg border bg-card p-6">
      <h2 id="sentiment-heading" className="mb-4 font-serif text-xl font-semibold">
        Sentiment
      </h2>
      {state.kind !== "ready" ? (
        <PanelStatus state={state} onRetry={onRetry} />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-muted-foreground">Overall tone</dt>
              <dd className="text-lg font-semibold capitalize">{state.data.sentiment.overall}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Compound score (−1 to 1)</dt>
              <dd className="font-medium tabular-nums">{state.data.sentiment.compound.toFixed(2)}</dd>
            </div>
          </dl>
          <figure className="h-[200px]">
            <figcaption className="sr-only">
              Share of positive, neutral and negative sentences
            </figcaption>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Positive", value: state.data.sentiment.positive },
                  { name: "Neutral", value: state.data.sentiment.neutral },
                  { name: "Negative", value: state.data.sentiment.negative },
                ]}
              >
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis width={36} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--chart-tooltip-bg)",
                    borderRadius: "6px",
                    border: "none",
                    color: "var(--chart-tooltip-text)",
                  }}
                  cursor={{ fill: "var(--chart-hover-bg)" }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="var(--chart-bar)" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </figure>
        </div>
      )}
    </section>
  )
}

export function WordCloudPanel({ state, onRetry }: PanelProps) {
  const words = state.kind === "ready" ? state.data.wordcloud_data?.words ?? [] : []

  return (
    <section aria-labelledby="wordcloud-heading" className="rounded-lg border bg-card p-6">
      <h2 id="wordcloud-heading" className="mb-4 font-serif text-xl font-semibold">
        Most frequent words
      </h2>
      {state.kind !== "ready" ? (
        <PanelStatus state={state} onRetry={onRetry} />
      ) : words.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">No word frequencies for this book.</p>
      ) : (
        <>
          <div className="h-[300px] w-full" aria-hidden>
            <ReactWordcloud words={words} options={wordcloudOptions} />
          </div>
          <p className="sr-only">
            Most frequent words: {words.slice(0, 15).map((w) => w.text).join(", ")}
          </p>
        </>
      )}
    </section>
  )
}
