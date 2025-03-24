from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from .models import Book, BookList
from .scraper import fetch_book, fetch_book_content
import edge_tts
import os
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
import io
import wave
import tempfile
import asyncio
import re
from .utils.text_chunking import chunk_text, get_chunk_info, process_text, load_embeddings
from .utils.llm_handler import llm_handler
import numpy as np

app = FastAPI(
    title="Gutenberg API",
    description="API for accessing Project Gutenberg books",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TTSRequest(BaseModel):
    text: str
    chunk_index: Optional[int] = 0
    total_chunks: Optional[int] = 1

class QueryRequest(BaseModel):
    query: str
    book_id: str
    temperature: Optional[float] = 0

def split_text_into_chunks(text: str, chunk_size: int = 1000) -> List[str]:
    """Split text into chunks at sentence boundaries."""
    # Split text into sentences
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks = []
    current_chunk = []
    current_size = 0
    
    for sentence in sentences:
        sentence_size = len(sentence)
        if current_size + sentence_size > chunk_size and current_chunk:
            chunks.append(' '.join(current_chunk))
            current_chunk = []
            current_size = 0
        
        current_chunk.append(sentence)
        current_size += sentence_size
    
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    
    return chunks

@app.get("/")
async def root():
    return {"message": "Welcome to Gutenberg API"}

@app.get("/books/{book_id}", response_model=Book)
async def get_book(book_id: str):
    # Fetch directly from Gutenberg without content
    book = fetch_book(book_id, include_content=False)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Start background task to process embeddings
    asyncio.create_task(process_book_embeddings(book_id))
    
    return book

async def process_book_embeddings(book_id: str):
    """Process book embeddings in the background."""
    try:
        print(f"\n=== Starting background processing for book {book_id} ===")
        
        # Fetch the content
        content = fetch_book_content(book_id)
        if not content:
            print(f"❌ No content found for book {book_id}")
            return
        
        # Compile full content from pages
        full_content = "\n\n".join(content['pages'])
        
        # Process the content (chunk and generate embeddings)
        processed_content = process_text(full_content, book_id)
        
        print(f"✅ Background processing completed for book {book_id}")
        print(f"Chunks: {processed_content['statistics']['total_chunks']}")
        
    except Exception as e:
        print(f"❌ Error in background processing: {str(e)}")

@app.get("/books/{book_id}/content")
async def get_book_content(book_id: str):
    print(f"\n=== Fetching content for book {book_id} ===")
    
    # Fetch the content (already paginated)
    content = fetch_book_content(book_id)
    if not content:
        print("❌ No content found")
        raise HTTPException(status_code=404, detail="Book content not found")
    
    # Compile full content from pages
    full_content = "\n\n".join(content['pages'])
    
    # Process the content (chunk and generate embeddings)
    processed_content = process_text(full_content)
    
    # Return everything
    response = {
        **content,  # Original paginated content
        "processed_content": {
            "chunks": processed_content["chunks"],
            "embeddings": processed_content["embeddings"],
            "statistics": processed_content["statistics"]
        }
    }
    
    print(f"✅ Content processed successfully")
    print(f"Pages: {content['total_pages']}")
    print(f"Chunks: {processed_content['statistics']['total_chunks']}")
    
    return response

@app.get("/books/search/{query}", response_model=List[Book])
async def search_books_route(query: str):
    # For now, return empty list since we removed the database
    return []

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/tts")
async def text_to_speech(request: TTSRequest):
    try:
        print(f"\n=== Processing TTS request ===")
        print(f"Text length: {len(request.text)} characters")
        print(f"Chunk {request.chunk_index + 1} of {request.total_chunks}")
        
        # Initialize edge-tts
        print("Initializing TTS...")
        communicate = edge_tts.Communicate(request.text, "en-US-JennyNeural", rate="+0%")
        
        # Create a temporary file
        print("Generating speech...")
        with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as temp_file:
            temp_path = temp_file.name
        
        # Generate speech to the temporary file
        await communicate.save(temp_path)
        
        # Read the generated audio file
        with open(temp_path, 'rb') as audio_file:
            audio_data = audio_file.read()
        
        # Clean up the temporary file
        os.unlink(temp_path)
        
        print("Successfully generated audio")
        
        # Return the audio stream with chunk information
        return StreamingResponse(
            io.BytesIO(audio_data),
            media_type="audio/mp3",
            headers={
                "Content-Disposition": f"attachment; filename=speech_chunk_{request.chunk_index}.mp3",
                "X-Chunk-Index": str(request.chunk_index),
                "X-Total-Chunks": str(request.total_chunks)
            }
        )
    except Exception as e:
        print(f"Error in TTS endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tts/chunks")
async def get_text_chunks(request: TTSRequest):
    """Get the text split into chunks."""
    chunks = split_text_into_chunks(request.text)
    return {
        "chunks": chunks,
        "total_chunks": len(chunks)
    }

@app.post("/books/{book_id}/ask")
async def ask_about_book(book_id: str, request: QueryRequest):
    """
    Answer questions about a specific book using the LLM.
    """
    try:
        print(f"\n=== Processing query for book {book_id} ===")
        print(f"Query: {request.query}")
        
        # Load existing embeddings
        chunk_embeddings = load_embeddings(book_id)
        if not chunk_embeddings:
            raise HTTPException(
                status_code=404, 
                detail="Book embeddings not found. Please wait a moment and try again."
            )
        
        # Get chunks from embeddings
        chunks = [chunk["text"] for chunk in chunk_embeddings]
        
        # For now, we'll use all chunks as context
        # (Later we can implement semantic search to find relevant chunks)
        context = "\n\n".join(chunks[:3])
        
        # Generate response using LLM
        response = await llm_handler.generate_response(
            query=request.query,
            context=context,
            temperature=request.temperature
        )
        
        return {
            "query": request.query,
            "response": response,
            "book_id": book_id
        }
        
    except Exception as e:
        print(f"❌ Error processing query: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing query: {str(e)}"
        )

@app.post("/books/{book_id}/generate-embeddings")
async def generate_book_embeddings(book_id: str):
    """
    Generate embeddings for a book's content.
    """
    try:
        print(f"\n=== Generating embeddings for book {book_id} ===")
        
        # Fetch the content
        content = fetch_book_content(book_id)
        if not content:
            print("❌ No content found")
            raise HTTPException(status_code=404, detail="Book content not found")
        
        # Compile full content from pages
        full_content = "\n\n".join(content['pages'])
        
        # Process the content (chunk and generate embeddings)
        processed_content = process_text(full_content, book_id)
        
        print(f"✅ Embeddings generated successfully")
        print(f"Chunks: {processed_content['statistics']['total_chunks']}")
        
        return {
            "book_id": book_id,
            "status": "success",
            "statistics": processed_content['statistics'],
            "source": processed_content['source']
        }
        
    except Exception as e:
        print(f"❌ Error generating embeddings: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating embeddings: {str(e)}"
        )

@app.post("/books/{book_id}/sentiment")
async def get_book_sentiment(book_id: str):
    """
    Analyze the sentiment of a book's content.
    """
    try:
        print(f"\n=== Analyzing sentiment for book {book_id} ===")
        
        # Fetch the content
        content = fetch_book_content(book_id)
        if not content:
            print("❌ No content found")
            raise HTTPException(status_code=404, detail="Book content not found")
        
        # Load existing embeddings to avoid reprocessing
        chunk_embeddings = load_embeddings(book_id)
        if not chunk_embeddings:
            # If embeddings don't exist, start a background task to generate them
            print("Embeddings not found, generating in background...")
            asyncio.create_task(process_book_embeddings(book_id))
            raise HTTPException(
                status_code=404, 
                detail="Book embeddings not found. Please try again later."
            )
        
        # Get chunks from embeddings
        chunks = [chunk["text"] for chunk in chunk_embeddings]
        
        # Analyze book-wide sentiment (use a representative sample)
        sample_text = "\n\n".join(chunks[:10])  # Analyze first 10 chunks
        
        # Use LLM to generate sentiment analysis
        prompt = f"""
        Analyze the following text and provide a detailed sentiment analysis.
        
        Text to analyze:
        {sample_text}
        
        Provide your analysis in JSON format:
        {{
            "sentiment": {{
                "positive": 0.0 to 1.0,
                "negative": 0.0 to 1.0,
                "neutral": 0.0 to 1.0,
                "overall": "positive/negative/neutral",
                "compound": -1.0 to 1.0
            }},
            "wordcloud_data": {{
                "words": [
                    {{ "text": "word1", "value": frequency_count }},
                    {{ "text": "word2", "value": frequency_count }},
                    ...
                ]
            }}
        }}
        
        Make sure the positive, negative, and neutral scores add up to 1.0. The wordcloud_data.words should contain at least 50 of the most significant words from the text with their frequency counts.
        """
        
        # Generate sentiment analysis using LLM
        sentiment_analysis = await llm_handler.generate_response(
            query=prompt,
            context="",
            temperature=0.3
        )
        
        try:
            # Try to parse the response as JSON
            import json
            sentiment_data = json.loads(sentiment_analysis)
            
            return sentiment_data
            
        except json.JSONDecodeError:
            # If JSON parsing fails, return a structured format with the raw text
            return {
                "sentiment": {
                    "positive": 0.5,
                    "negative": 0.1,
                    "neutral": 0.4,
                    "overall": "positive",
                    "compound": 0.4
                },
                "wordcloud_data": {
                    "words": [
                        {"text": "Error", "value": 100},
                        {"text": "Parsing", "value": 80},
                        {"text": "JSON", "value": 60}
                    ]
                },
                "raw_response": sentiment_analysis
            }
        
    except Exception as e:
        print(f"❌ Error analyzing sentiment: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing sentiment: {str(e)}"
        ) 