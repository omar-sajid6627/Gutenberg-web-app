import { NextRequest, NextResponse } from 'next/server'

// Define API_BASE_URL directly
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dull-meggie-1omar-d9f030db.koyeb.app';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestBody = await request.json()
    const bookId = params.id

    console.log(`Sending request to backend for book ${bookId}:`, requestBody.query)

    // Make the request to the backend with book_id in the body
    const backendResponse = await fetch(`${API_BASE_URL}/books/${bookId}/ask`, {
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
    console.log('Backend response received:', data)
    
    // Check if the response has the expected format
    let answer = '';
    if (data.response) {
      answer = data.response;
    } else if (data.answer) {
      answer = data.answer;
    } else if (typeof data === 'string') {
      answer = data;
    } else {
      console.log('Unexpected response format:', data);
      answer = JSON.stringify(data);
    }
    
    return NextResponse.json({ answer })

  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to process request', details: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
} 