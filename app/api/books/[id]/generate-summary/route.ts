import { NextRequest, NextResponse } from 'next/server'

// Define API_BASE_URL directly
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dull-meggie-1omar-d9f030db.koyeb.app';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookId = params.id
    console.log(`Generating summary for book ${bookId}`)

    // Make the request to the backend with book_id and a specific summary request
    const backendResponse = await fetch(`${API_BASE_URL}/books/${bookId}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        book_id: bookId,
        query: "Provide a concise, engaging summary of this book in 2-3 paragraphs. Focus on the main plot, themes, and significance. Make it compelling for readers. The summary should be strictly in English.",
        temperature: 0.3 // Slightly higher temperature for more creative summary
      })
    })

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error('Backend error response when generating summary:', errorText)
      return NextResponse.json(
        { error: 'Backend request failed', details: errorText },
        { status: backendResponse.status }
      )
    }

    const data = await backendResponse.json()
    console.log('Summary generated:', data)
    
    // Check if the response has the expected format
    let summary = '';
    if (data.response) {
      summary = data.response;
    } else if (data.answer) {
      summary = data.answer;
    } else if (typeof data === 'string') {
      summary = data;
    } else {
      console.log('Unexpected response format:', data);
      summary = JSON.stringify(data);
    }
    
    return NextResponse.json({ summary })

  } catch (error: any) {
    console.error('Error generating summary:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary', details: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
} 