"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronLeft, ChevronRight, Type, Minus, Plus, Volume2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import type { Book } from "@/types/book"
import { useBookContent } from "@/hooks/useBookContent"
import { BookChat } from "../../../components/BookChat"
import { MarkdownRenderer } from "@/app/components/MarkdownRenderer"
import { API_BASE_URL } from '@/app/lib/env'

interface BookReaderProps {
  book: Book
}

const PARAGRAPHS_PER_PAGE = 10

/**
 * Utility function to clean up paragraph text:
 * - Remove underscores often used for italicization
 * - Collapse multiple spaces/newlines
 * - Trim leading and trailing whitespace
 */
function cleanParagraph(paragraph: string): string {
  return paragraph
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .trim() // Trim whitespace at ends
}

export function BookReader({ book }: BookReaderProps) {
  const { content, isLoading, error } = useBookContent(book.id)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [fontSize, setFontSize] = useState(18)
  const [lineHeight, setLineHeight] = useState(1.8)
  const [showSettings, setShowSettings] = useState(false)
  const [isTTSEnabled, setIsTTSEnabled] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAudioPosition, setCurrentAudioPosition] = useState(0)
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0)
  const [totalChunks, setTotalChunks] = useState(0)
  const [textChunks, setTextChunks] = useState<string[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioQueueRef = useRef<HTMLAudioElement[]>([])
  const isBufferingRef = useRef(false)
  const audioCacheRef = useRef<{ [key: number]: { url: string, position: number } }>({})

  // Split content into paragraphs from the current page
  const paragraphs =
    book.content?.[currentPage - 1]
      ?.split("_")
      .filter((p: string) => p.trim())
      .map(cleanParagraph) || []

  // Calculate total pages
  useEffect(() => {
    setTotalPages(book?.content?.length || 0)
  }, [book?.content])

  // Get paragraphs for current page
  const currentParagraphs = paragraphs

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      // Stop TTS if playing when changing pages
      if (isPlaying) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        // Clear the audio queue
        audioQueueRef.current.forEach(audio => {
          audio.pause();
          audio.src = '';
        });
        audioQueueRef.current = [];
        setIsPlaying(false);
        setIsTTSEnabled(false);
      }
      clearAudioCache();
      // Reset all TTS-related state
      setCurrentChunkIndex(0);
      setTotalChunks(0);
      setTextChunks([]);
      setCurrentAudioPosition(0);
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      // Stop TTS if playing when changing pages
      if (isPlaying) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        // Clear the audio queue
        audioQueueRef.current.forEach(audio => {
          audio.pause();
          audio.src = '';
        });
        audioQueueRef.current = [];
        setIsPlaying(false);
        setIsTTSEnabled(false);
      }
      clearAudioCache();
      // Reset all TTS-related state
      setCurrentChunkIndex(0);
      setTotalChunks(0);
      setTextChunks([]);
      setCurrentAudioPosition(0);
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 1, 24))
  }

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 1, 14))
  }

  const increaseLineHeight = () => {
    setLineHeight((prev) => Math.min(prev + 0.1, 2.5))
  }

  const decreaseLineHeight = () => {
    setLineHeight((prev) => Math.max(prev - 0.1, 1.2))
  }

  // Function to get text for current page
  const getCurrentPageText = () => {
    if (!currentParagraphs || currentParagraphs.length === 0) {
      console.error('No paragraphs available for current page');
      return '';
    }
    return currentParagraphs.join(' ').trim();
  };

  // Function to generate and play a specific chunk
  const generateAndPlayChunk = async (chunkIndex: number) => {
    try {
      console.log(`Generating chunk ${chunkIndex + 1} of ${totalChunks}`);
      const text = textChunks[chunkIndex];
      
      // Check if we have cached audio for this chunk
      if (chunkIndex in audioCacheRef.current) {
        console.log('Using cached audio for chunk', chunkIndex);
        if (audioRef.current) {
          audioRef.current.src = audioCacheRef.current[chunkIndex].url;
          audioRef.current.currentTime = audioCacheRef.current[chunkIndex].position;
          await audioRef.current.play();
        }
        return;
      }

      const response = await fetch(`${API_BASE_URL}/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text,
          chunk_index: chunkIndex,
          total_chunks: totalChunks
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate speech: ${response.statusText}`);
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      
      // Cache the audio URL
      audioCacheRef.current[chunkIndex] = {
        url: audioUrl,
        position: 0
      };
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Error generating chunk:', error);
      setIsPlaying(false);
      setIsTTSEnabled(false);
    }
  };

  // Function to generate next chunk in background
  const generateNextChunk = async (chunkIndex: number) => {
    if (chunkIndex >= totalChunks - 1) return;
    
    const nextChunkIndex = chunkIndex + 1;
    const text = textChunks[nextChunkIndex];
    
    // Skip if already cached
    if (nextChunkIndex in audioCacheRef.current) {
      return;
    }

    try {
      console.log(`Pre-generating chunk ${nextChunkIndex + 1} of ${totalChunks}`);
      const response = await fetch(`${API_BASE_URL}/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text,
          chunk_index: nextChunkIndex,
          total_chunks: totalChunks
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate speech: ${response.statusText}`);
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      
      // Cache the audio URL
      audioCacheRef.current[nextChunkIndex] = {
        url: audioUrl,
        position: 0
      };
      
      console.log(`Successfully cached chunk ${nextChunkIndex + 1}`);
    } catch (error) {
      console.error('Error pre-generating chunk:', error);
    }
  };

  // Function to generate all chunks in background
  const generateAllChunks = async () => {
    const promises = [];
    for (let i = 0; i < totalChunks; i++) {
      if (!(i in audioCacheRef.current)) {
        promises.push(generateNextChunk(i - 1));
      }
    }
    await Promise.all(promises);
  };

  // Function to handle TTS toggle
  const handleTTSToggle = async () => {
    if (isPlaying) {
      // Store current position before stopping
      if (audioRef.current) {
        setCurrentAudioPosition(audioRef.current.currentTime);
        // Cache the current audio position
        if (currentChunkIndex in audioCacheRef.current) {
          audioCacheRef.current[currentChunkIndex].position = audioRef.current.currentTime;
        }
        audioRef.current.pause();
      }
      // Clear the audio queue
      audioQueueRef.current.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      audioQueueRef.current = [];
      setIsPlaying(false);
      setIsTTSEnabled(false);
      return;
    }

    // Start TTS
    try {
      console.log('TTS handler triggered');
      setIsPlaying(true);
      setIsTTSEnabled(true);
      const text = getCurrentPageText();
      
      if (!text) {
        throw new Error('No text available for TTS');
      }

      // First, get the text chunks
      const chunksResponse = await fetch(`${API_BASE_URL}/tts/chunks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!chunksResponse.ok) {
        throw new Error('Failed to get text chunks');
      }

      const { chunks, total_chunks } = await chunksResponse.json();
      setTextChunks(chunks);
      setTotalChunks(total_chunks);
      setCurrentChunkIndex(0);

      // Start playing the first chunk immediately
      await generateAndPlayChunk(0);
      
      // Start caching the next chunk in background
      if (total_chunks > 1) {
        generateNextChunk(0);
      }
    } catch (error) {
      console.error('TTS Error:', error);
      setIsPlaying(false);
      setIsTTSEnabled(false);
    }
  };

  // Handle audio end
  const handleAudioEnd = async () => {
    if (currentChunkIndex < totalChunks - 1) {
      // Move to next chunk
      const nextChunkIndex = currentChunkIndex + 1;
      setCurrentChunkIndex(nextChunkIndex);
      
      // Start caching the chunk after next in background immediately
      if (nextChunkIndex < totalChunks - 1) {
        generateNextChunk(nextChunkIndex);
      }
      
      // Play the next chunk if it's cached
      if (nextChunkIndex in audioCacheRef.current) {
        if (audioRef.current) {
          audioRef.current.src = audioCacheRef.current[nextChunkIndex].url;
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
      } else {
        // If not cached, generate and play it
        await generateAndPlayChunk(nextChunkIndex);
      }
    } else {
      setIsPlaying(false);
      setCurrentAudioPosition(0);
      if (isTTSEnabled && currentPage < totalPages) {
        handleNextPage();
        handleTTSToggle();
      }
    }
  };

  // Handle audio time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentAudioPosition(audioRef.current.currentTime);
    }
  };

  // Clear audio cache when changing pages
  const clearAudioCache = () => {
    // Revoke all cached audio URLs
    Object.values(audioCacheRef.current).forEach(({ url }) => {
      URL.revokeObjectURL(url);
    });
    audioCacheRef.current = {};
  };

  // Determine the content format for the current page
  const detectContentFormat = (content: string): 'markdown' | 'html' | 'plaintext' => {
    if (!content) return 'plaintext';
    
    // Check for HTML tags
    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(content);
    
    // Check for markdown syntax
    const hasMarkdownSyntax = /(\*\*|__|##|>\s|\[.*\]\(.*\))/i.test(content);
    
    if (hasHtmlTags) return 'html';
    if (hasMarkdownSyntax) return 'markdown';
    return 'plaintext';
  };
  
  // Get content for the current page
  const currentPageContent = book.content?.[currentPage - 1] || '';
  const contentFormat = detectContentFormat(currentPageContent);

  return (
    <motion.div
      className="min-h-screen bg-background text-foreground overflow-hidden relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center">
            <Link href={`/book/${book.id}`}>
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold">{book.title}</h1>
              <p className="text-sm text-muted-foreground">by {book.author}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={isTTSEnabled ? "default" : "ghost"} 
              size="icon" 
              onClick={handleTTSToggle}
              className="relative"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowSettings(!showSettings)} 
              className="relative"
            >
              <Type className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Reading Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-14 right-4 z-40 bg-card border rounded-lg shadow-lg p-4 w-64"
          >
            <h3 className="font-medium mb-3">Reading Preferences</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Font Size</span>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" onClick={decreaseFontSize} className="h-7 w-7">
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-xs w-6 text-center">{fontSize}</span>
                    <Button variant="outline" size="icon" onClick={increaseFontSize} className="h-7 w-7">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Line Spacing</span>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" onClick={decreaseLineHeight} className="h-7 w-7">
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-xs w-6 text-center">{lineHeight.toFixed(1)}</span>
                    <Button variant="outline" size="icon" onClick={increaseLineHeight} className="h-7 w-7">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add hidden audio element with timeupdate handler */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnd}
        onError={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 p-6 rounded-xl border border-destructive/20 shadow-lg my-8">
            <h2 className="text-xl font-medium mb-2 text-destructive">Error Loading Content</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : (
          <div className="my-8">
            <MarkdownRenderer
              content={currentPageContent}
              format={contentFormat}
              fontSize={fontSize}
              lineHeight={lineHeight}
              className="reader-content"
            />
          </div>
        )}

        {/* Add BookChat component */}
        <BookChat 
          bookId={book.id} 
          bookTitle={book.title}
          className="fixed bottom-24 left-6 z-50" // Position above the pagination controls
        />

        {/* Pagination Controls */}
        {!isLoading && content && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t"
          >
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="transition-transform hover:scale-105"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="transition-transform hover:scale-105"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </motion.div>
  )
}

