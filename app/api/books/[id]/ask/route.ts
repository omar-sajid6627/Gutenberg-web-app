import { NextRequest, NextResponse } from "next/server"
import { forwardQuestion } from "@/lib/backend"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json().catch(() => null)
  const query = typeof body?.query === "string" ? body.query.trim() : ""
  if (!query) {
    return NextResponse.json({ error: "A question is required" }, { status: 400 })
  }
  return forwardQuestion(params.id, query, 0, "answer")
}
