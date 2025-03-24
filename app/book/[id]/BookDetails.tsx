"use client"

import { motion } from "framer-motion"
import { DarkModeToggle } from "@/components/DarkModeToggle"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, BookOpen, FileText, Book, Tablet, FileDown, RefreshCw, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { BookChat } from "../../components/BookChat"
import { useEffect, useState } from "react"
import { TriggerBookEmbeddings } from "../../components/TriggerBookEmbeddings"
import { SentimentAnalysis } from "@/app/components/sentimentAnalysis"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Head from "next/head"

interface BookDetails {
  id: string
  title: string
  author: string
  language: string
  category: string
  ebookNo: string
  releaseDate: string
  summary: string
  coverUrl: string | null
  downloads: number
  readingEaseScore: number | null
  bookTypes?: string[]
  keywords?: { [key: string]: string[] }
}

interface BookDetailsProps {
  book: BookDetails
}

const ReadingEaseScore = ({ score, isEstimated = false }: { score: number | null; isEstimated?: boolean }) => {
  // The score should never be null now, but keep the parameter type as-is for compatibility
  const actualScore = score as number

  // Calculate color based on score
  const getColor = (score: number) => {
    if (score >= 90) return "#22c55e" // green
    if (score >= 70) return "#3b82f6" // blue
    if (score >= 50) return "#f59e0b" // yellow
    return "#ef4444" // red
  }

  const getDifficulty = (score: number) => {
    if (score >= 90) return "Very Easy"
    if (score >= 70) return "Easy"
    if (score >= 50) return "Moderate"
    return "Difficult"
  }

  const circumference = 2 * Math.PI * 45
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (actualScore / 100) * circumference

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  const circleVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: actualScore / 100,
      opacity: 1,
      transition: {
        pathLength: { delay: 0.5, type: "spring", duration: 1.5, bounce: 0.3 },
        opacity: { duration: 0.5 },
      },
    },
  }

  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 1.2,
        duration: 0.5,
      },
    },
  }

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse" as const,
      },
    },
  }

  const difficulty = getDifficulty(actualScore)
  const color = getColor(actualScore)

  return (
    <motion.div
      className="flex flex-col items-center space-y-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="relative w-36 h-36">
        {/* Decorative elements */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: `${color}15` }}
          variants={pulseVariants}
          animate="pulse"
        />

        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
            className="transition-all duration-300"
          />

          {/* Score arc */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            variants={circleVariants}
            initial="hidden"
            animate="visible"
            custom={actualScore}
          />

          {/* Decorative dots along the circle */}
          {[0, 25, 50, 75, 100].map((marker) => {
            const angle = (marker / 100) * 360 - 90
            const x = 50 + 45 * Math.cos((angle * Math.PI) / 180)
            const y = 50 + 45 * Math.sin((angle * Math.PI) / 180)
            const isActive = marker <= actualScore

            return (
              <motion.circle
                key={marker}
                cx={x}
                cy={y}
                r="3"
                fill={isActive ? color : "#e5e7eb"}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1 + marker / 200, duration: 0.3 }}
              />
            )
          })}
        </svg>

        <motion.div
          className="absolute inset-0 flex items-center justify-center flex-col"
          variants={textVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="text-3xl font-bold"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
          >
            {Math.round(actualScore)}
          </motion.div>
          <div className="text-sm text-gray-500 font-medium">Reading Ease</div>
        </motion.div>
      </div>

      <motion.div
        className="text-sm font-medium px-3 py-1 rounded-full"
        style={{
          backgroundColor: `${color}20`,
          color: color,
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7, duration: 0.5 }}
      >
        {difficulty}
      </motion.div>

      <motion.div
        className="text-xs text-muted-foreground max-w-[200px] text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 2, duration: 0.5 }}
      >
        {actualScore >= 90
          ? "Very accessible reading for all ages"
          : actualScore >= 70
            ? "Easily understood by most readers"
            : actualScore >= 50
              ? "Moderate difficulty, requires some focus"
              : "Complex text requiring careful reading"}
      </motion.div>

      {isEstimated && (
        <motion.div
          className="text-xs text-muted-foreground italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 2.2, duration: 0.5 }}
        >
          (Estimated score)
        </motion.div>
      )}
    </motion.div>
  )
}

// Add this new component for displaying genres and keywords
const GenresAndKeywords = ({
  bookTypes,
  keywords,
}: { bookTypes?: string[]; keywords?: { [key: string]: string[] } }) => {
  if (!bookTypes || !keywords || bookTypes.length === 0) return null

  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
        duration: 0.5,
      },
    },
  }

  // Animation variants for genre cards
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 12,
        delay: i * 0.1,
        duration: 0.8,
      },
    }),
    hover: {
      scale: 1.02,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      borderColor: "var(--primary)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
  }

  // Animation variants for title
  const titleVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
        delay: 0.2,
      },
    },
  }

  // Animation variants for keywords
  const keywordVariants = {
    hidden: {
      opacity: 0,
      scale: 0.6,
      y: 10,
    },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15,
        delay: i * 0.05 + 0.2,
      },
    }),
    hover: {
      scale: 1.08,
      backgroundColor: "var(--primary)",
      color: "var(--primary-foreground)",
      y: -3,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 10,
      },
    },
  }

  // Animation for the decorative dot
  const dotVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 15,
        delay: 0.3,
      },
    },
  }

  // Animation for the section title
  const sectionTitleVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-4 mt-6 relative">
      {/* Decorative elements */}
      <motion.div
        className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-primary/20 blur-xl"
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: [0.2, 0.5, 0.2],
          scale: [1, 1.2, 1],
          x: [0, 5, 0],
          y: [0, -5, 0],
        }}
        transition={{
          duration: 5,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />
      <motion.div
        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary/20 blur-xl"
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: [0.2, 0.6, 0.2],
          scale: [1, 1.3, 1],
          x: [0, -5, 0],
          y: [0, 5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          delay: 1,
        }}
      />

      <motion.h2
        className="text-xl font-serif-reading font-semibold relative inline-block"
        variants={sectionTitleVariants}
      >
        Genres & Keywords
        <motion.span
          className="absolute -bottom-1 left-0 h-0.5 bg-primary/60 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
        />
      </motion.h2>

      <div className="grid grid-cols-1 gap-4">
        {bookTypes.map((type, typeIndex) => (
          <motion.div
            key={type}
            custom={typeIndex}
            variants={cardVariants}
            whileHover="hover"
            className="bg-card/80 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-primary/10 
                      transition-all duration-300 overflow-hidden relative"
          >
            {/* Animated background gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50"
              initial={{ x: "-100%" }}
              animate={{ x: ["100%", "0%", "0%"] }}
              transition={{
                duration: 3,
                times: [0, 0.7, 1],
                delay: typeIndex * 0.2,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 5,
              }}
            />

            <motion.h3
              className="text-lg font-medium mb-3 inline-flex items-center relative z-10"
              variants={titleVariants}
            >
              <motion.span
                className="inline-block w-2.5 h-2.5 rounded-full bg-primary mr-2"
                variants={dotVariants}
                initial="hidden"
                animate="visible"
              />
              {type}
            </motion.h3>

            <motion.div
              className="flex flex-wrap gap-2 relative z-10"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              {keywords[type]?.map((keyword, kwIndex) => (
                <motion.span
                  key={keyword}
                  custom={kwIndex}
                  variants={keywordVariants}
                  whileHover="hover"
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm 
                            bg-primary/10 text-primary transition-all duration-300
                            cursor-pointer shadow-sm"
                >
                  {keyword}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export function BookDetails({ book }: BookDetailsProps) {
  const [isScoreEstimated, setIsScoreEstimated] = useState(false)
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [sentimentError, setSentimentError] = useState<string | null>(null)
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false)
  
  // Function to toggle summary expansion
  const toggleSummaryExpansion = () => {
    setIsSummaryExpanded(!isSummaryExpanded);
  };
  
  // Function to check if summary needs to be regenerated
  const needsSummaryGeneration = () => {
    return !book.summary || book.summary === 'N/A' || book.summary.trim() === '';
  }
  
  // Function to handle sentiment analysis errors
  const handleSentimentError = (error: string) => {
    console.log("Sentiment analysis error:", error);
    setSentimentError(error);
  }
  
  // Function to truncate text with proper word boundaries
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    
    // Find the last space before maxLength
    const lastSpaceIndex = text.lastIndexOf(' ', maxLength);
    const truncated = text.substring(0, lastSpaceIndex > 0 ? lastSpaceIndex : maxLength);
    
    return truncated + '...';
  };
  
  // Function to generate summary using LLM
  const generateSummary = async () => {
    if (!needsSummaryGeneration() && !generatedSummary) {
      return; // No need to generate if we already have a summary
    }
    
    try {
      setIsGeneratingSummary(true);
      setSummaryError(null);
      
      const response = await fetch(`/api/books/${book.id}/generate-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }
      
      const data = await response.json();
      setGeneratedSummary(data.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummaryError('Unable to generate summary. Please try again.');
    } finally {
      setIsGeneratingSummary(false);
    }
  }
  
  // Generate summary on load if needed
  useEffect(() => {
    if (needsSummaryGeneration() && !generatedSummary && !isGeneratingSummary) {
      generateSummary();
    }
  }, [book.id]);
  
  // Function to display appropriate summary content
  const renderSummaryContent = () => {
    if (isGeneratingSummary) {
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generating summary...</span>
        </div>
      );
    }
    
    if (summaryError) {
      return (
        <div className="space-y-3">
          <p className="text-muted-foreground">{summaryError}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateSummary} 
            className="flex items-center gap-2"
            disabled={isGeneratingSummary}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </Button>
        </div>
      );
    }
    
    // Get the appropriate summary text
    let summaryText = '';
    let isAIGenerated = false;
    
    if (generatedSummary) {
      summaryText = generatedSummary;
      isAIGenerated = true;
    } else if (book.summary) {
      summaryText = book.summary;
    } else {
      return <p className="text-muted-foreground">No summary available.</p>;
    }
    
    // If summary is short enough, don't add collapse functionality
    if (summaryText.length < 300) {
      return (
        <div className="space-y-3">
          <p className="text-muted-foreground leading-relaxed">{summaryText}</p>
          {isAIGenerated && (
            <p className="text-xs text-muted-foreground italic">
              (This summary was generated using AI and may not perfectly reflect the book's content)
            </p>
          )}
        </div>
      );
    }
    
    // For longer summaries, implement collapsible functionality
    const displayText = isSummaryExpanded ? summaryText : truncateText(summaryText, 300);
    
    return (
      <div className="space-y-3">
        <p className="text-muted-foreground leading-relaxed">{displayText}</p>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSummaryExpansion}
          className="flex items-center gap-1 text-primary hover:text-primary/80 px-2 h-auto py-1"
        >
          {isSummaryExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              <span>Show Less</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              <span>Show More</span>
            </>
          )}
        </Button>
        
        {isAIGenerated && (
          <p className="text-xs text-muted-foreground italic">
            (This summary was generated using AI and may not perfectly reflect the book's content)
          </p>
        )}
      </div>
    );
  };
  
  useEffect(() => {
    if (book.readingEaseScore === null) {
      setIsScoreEstimated(true)
    }
  }, [book.readingEaseScore])

  // Save book to recently viewed when component mounts
  useEffect(() => {
    const saveToRecent = () => {
      const recentBooks = JSON.parse(localStorage.getItem("recentBooks") || "[]")
      const newBook = {
        id: book.id,
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
        readingEaseScore: book.readingEaseScore,
      }

      // Remove if already exists
      const filteredBooks = recentBooks.filter((b: any) => b.id !== book.id)

      // Add to beginning and limit to 6 books
      const updatedBooks = [newBook, ...filteredBooks].slice(0, 6)

      localStorage.setItem("recentBooks", JSON.stringify(updatedBooks))
    }

    saveToRecent()
  }, [book])

  // Get consistent random score based on book ID if original score is null
  const getConsistentRandomScore = () => {
    if (book.readingEaseScore !== null) return book.readingEaseScore

    // Use the book ID to create a consistent random number for the same book
    let hashNum = 0
    for (let i = 0; i < book.id.length; i++) {
      hashNum += book.id.charCodeAt(i)
    }

    // Generate a score between 50 and 100
    return 50 + (hashNum % 51)
  }

  // Function to handle book downloads
  const handleDownload = (format: string) => {
    let downloadUrl

    // Construct appropriate download URL based on format
    switch (format) {
      case "gutenberg":
        // Open the main download page
        downloadUrl = `https://www.gutenberg.org/ebooks/${book.ebookNo}`
        break
      case "epub":
        // Direct link to EPUB format
        downloadUrl = `https://www.gutenberg.org/ebooks/${book.ebookNo}.epub.images`
        break
      case "kindle":
        // Direct link to Kindle format
        downloadUrl = `https://www.gutenberg.org/ebooks/${book.ebookNo}.kindle.images`
        break
      case "html":
        // Direct link to HTML format
        downloadUrl = `https://www.gutenberg.org/files/${book.ebookNo}/${book.ebookNo}-h/${book.ebookNo}-h.htm`
        break
      case "text":
        // Direct link to plain text format - corrected pattern
        downloadUrl = `https://www.gutenberg.org/cache/epub/${book.ebookNo}/pg${book.ebookNo}.txt`
        break
      default:
        // Default to the main download page
        downloadUrl = `https://www.gutenberg.org/ebooks/${book.ebookNo}`
    }

    // Open the download URL in a new tab
    window.open(downloadUrl, "_blank")
  }

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 },
    },
  }

  // Header animation variants
  const headerVariants = {
    initial: { y: -20, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  // Content animation variants
  const contentVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.15,
      },
    },
  }

  // Item animation variants
  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  // Cover animation variants
  const coverVariants = {
    initial: { scale: 0.9, opacity: 0, rotateY: -15 },
    animate: {
      scale: 1,
      opacity: 1,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.3,
      },
    },
    hover: {
      scale: 1.03,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15,
      },
    },
  }

  // Floating animation for decorative elements
  const floatingAnimation = {
    y: [0, -10, 0],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 4,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "reverse" as const,
      ease: "easeInOut",
    },
  }

  // Define containerVariants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Function to sanitize URLs and prevent domain duplication
  const sanitizeUrl = (url: string | null) => {
    if (!url) return null
    // Remove any duplicate domains
    const cleanUrl = url.replace(
      /https:\/\/www\.gutenberg\.orghttps:\/\/www\.gutenberg\.org/,
      "https://www.gutenberg.org",
    )
    return cleanUrl
  }

  return (
    <>
      <Head>
        <title>{book.title}</title>
        <meta name="description" content={book.summary || `Read ${book.title} by ${book.author}`} />
      </Head>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen bg-background text-foreground overflow-hidden relative"
      >
        <main className="container mx-auto px-4 pt-24 pb-16">
          <div className="grid md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr] gap-8 md:gap-12">
            {/* Left Column (Book cover + word cloud) */}
            <div className="flex flex-col space-y-8">
              {/* Book Cover */}
              <motion.div 
                className="flex justify-center items-start md:sticky md:top-24" 
                variants={itemVariants}
              >
                <div className="relative w-[200px] md:w-[280px] lg:w-[320px] overflow-hidden rounded-md shadow-xl transition-shadow duration-300">
                  <Image
                    src={(sanitizeUrl(book.coverUrl) as string) || "/placeholder.svg"}
                    alt={`${book.title} cover`}
                    width={400}
                    height={600}
                    style={{ objectFit: "cover", width: "100%", height: "auto" }}
                    priority
                    className="transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 shadow-inner pointer-events-none"></div>
                </div>
              </motion.div>
              
              {/* Word Cloud (Desktop only) - Hidden if there's a sentiment error */}
              {!sentimentError && (
                <motion.div 
                  variants={itemVariants}
                  className="hidden md:block"
                >
                  <SentimentAnalysis bookId={book.id} wordCloudOnly={true} onError={setSentimentError} />
                </motion.div>
              )}
            </div>
            
            {/* Right Column (Book details, summary, sentiment analysis without word cloud) */}
            <div className="space-y-8">
              {/* Book Title and Author */}
              <motion.div className="space-y-2" variants={itemVariants}>
                <motion.h1
                  className="text-4xl font-serif-reading font-bold mb-2 relative inline-block"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {book.title}
                  <motion.span
                    className="absolute -bottom-1 left-0 h-0.5 bg-primary/60 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.8, duration: 1 }}
                  />
                </motion.h1>
                <motion.p
                  className="text-xl text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  by {book.author}
                </motion.p>
              </motion.div>
              
              {/* Book Summary */}
              <motion.div variants={itemVariants}>
                <motion.h2
                  className="text-xl font-serif-reading font-semibold mb-3 relative inline-block"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                >
                  Summary
                  <motion.span
                    className="absolute -bottom-1 left-0 h-0.5 bg-primary/60 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1.4, duration: 0.8 }}
                  />
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3, duration: 0.8 }}
                >
                  {renderSummaryContent()}
                </motion.div>
              </motion.div>
              
              {/* Reading Score */}
              <ReadingEaseScore score={book.readingEaseScore} isEstimated={false} />
              
              {/* Genres and Keywords */}
              <GenresAndKeywords
                bookTypes={book.bookTypes || []}
                keywords={book.keywords || {}}
              />
              
              {/* Word Cloud (Mobile only) - Hidden if there's a sentiment error */}
              {!sentimentError && (
                <motion.div 
                  variants={itemVariants}
                  className="md:hidden"
                >
                  <SentimentAnalysis bookId={book.id} wordCloudOnly={true} onError={setSentimentError} />
                </motion.div>
              )}
              
              {/* Sentiment Analysis without word cloud - Hidden if there's a sentiment error */}
              {!sentimentError && (
                <motion.div variants={itemVariants}>
                  <SentimentAnalysis bookId={book.id} hideWordCloud={true} onError={setSentimentError} />
                </motion.div>
              )}
              
              {/* Book Details */}
              <motion.div className="space-y-6" variants={itemVariants}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <motion.div
                      className="space-y-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    >
                      <p className="text-sm text-muted-foreground">EBook-No.</p>
                      <p className="font-medium">{book.ebookNo}</p>
                    </motion.div>

                    <motion.div
                      className="space-y-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                    >
                      <p className="text-sm text-muted-foreground">Language</p>
                      <p className="font-medium">{book.language}</p>
                    </motion.div>
                  </div>

                  <div className="space-y-6">
                    <motion.div
                      className="space-y-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9, duration: 0.5 }}
                    >
                      <p className="text-sm text-muted-foreground">Release Date</p>
                      <p className="font-medium">{book.releaseDate}</p>
                    </motion.div>

                    <motion.div
                      className="space-y-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1, duration: 0.5 }}
                    >
                      <p className="text-sm text-muted-foreground">Downloads (30 days)</p>
                      <p className="font-medium">{book.downloads.toLocaleString()}</p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
              
              {/* Book Actions */}
              <motion.div className="flex gap-4 pt-2" variants={itemVariants}>
                <Link href={`/book/${book.id}/read`} rel="noopener noreferrer">
                  <Button className="flex items-center gap-2 relative overflow-hidden group">
                    <motion.div
                      className="absolute inset-0 bg-primary/20"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "0%" }}
                      transition={{ duration: 0.3 }}
                    />
                    <BookOpen className="h-4 w-4 relative z-10" />
                    <span className="relative z-10">Read Book</span>
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 relative overflow-hidden group">
                      <motion.div
                        className="absolute inset-0 bg-primary/10"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "0%" }}
                        transition={{ duration: 0.3 }}
                      />
                      <Download className="h-4 w-4 relative z-10" />
                      <span className="relative z-10">Download</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 p-2">
                    <DropdownMenuItem
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => handleDownload("epub")}
                    >
                      <Book className="h-4 w-4" />
                      <span>EPUB</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => handleDownload("kindle")}
                    >
                      <Tablet className="h-4 w-4" />
                      <span>Kindle (MOBI)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => handleDownload("html")}
                    >
                      <FileDown className="h-4 w-4" />
                      <span>HTML</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => handleDownload("text")}
                    >
                      <FileText className="h-4 w-4" />
                      <span>Plain Text</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => handleDownload("gutenberg")}
                    >
                      <Download className="h-4 w-4" />
                      <span>All Formats</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
              
              {/* Add the BookChat component */}
              <BookChat bookId={book.id} bookTitle={book.title} />
            </div>
          </div>
        </main>
      </motion.div>
    </>
  )
}

