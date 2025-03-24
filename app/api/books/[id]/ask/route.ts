import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestBody = await request.json()
    const bookId = params.id

    // Make the request to the backend with book_id in the body
    const backendResponse = await fetch(`http://localhost:8000/books/${bookId}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        book_id: bookId,  // Add book_id to the request body
        query: requestBody.query,
        temperature: 0
      })
    })

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error('Backend error response:', errorText)
      return NextResponse.json(
        { error: 'Backend request failed', details: errorText },
        { status: backendResponse.status }
      )
    }

    const data = await backendResponse.json()
    return NextResponse.json({ answer: data.response })

  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to process request', details: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
} 