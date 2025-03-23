import { forwardQuestion } from "@/lib/backend"

const SUMMARY_PROMPT =
  "Provide a concise, engaging summary of this book in 2-3 paragraphs. " +
  "Focus on the main plot, themes, and significance. The summary should be strictly in English."

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  return forwardQuestion(params.id, SUMMARY_PROMPT, 0.3, "summary")
}
