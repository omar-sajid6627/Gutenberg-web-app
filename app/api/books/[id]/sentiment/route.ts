import { NextRequest, NextResponse } from 'next/server'

// Define API_BASE_URL directly
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dull-meggie-1omar-d9f030db.koyeb.app';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookId = params.id

    // Make the request to the backend
    const backendResponse = await fetch(`${API_BASE_URL}/books/${bookId}/sentiment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
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
    
    // Return the data directly - it's already in the expected format
    return NextResponse.json(data)

  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to process sentiment analysis', details: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
} 