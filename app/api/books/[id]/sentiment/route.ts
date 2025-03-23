import { forwardSentiment } from "@/lib/backend"

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  return forwardSentiment(params.id)
}
