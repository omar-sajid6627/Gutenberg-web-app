"use client"

import { motion } from "framer-motion"
import { DarkModeToggle } from "@/components/DarkModeToggle"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, BookOpen } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { BookChat } from "../../components/BookChat"

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

const ReadingEaseScore = ({ score }: { score: number | null }) => {
  if (score === null) return null

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
  const strokeDashoffset = circumference - (score / 100) * circumference

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
      pathLength: score / 100,
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

  const difficulty = getDifficulty(score)
  const color = getColor(score)

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
            custom={score}
          />

          {/* Decorative dots along the circle */}
          {[0, 25, 50, 75, 100].map((marker) => {
            const angle = (marker / 100) * 360 - 90
            const x = 50 + 45 * Math.cos((angle * Math.PI) / 180)
            const y = 50 + 45 * Math.sin((angle * Math.PI) / 180)
            const isActive = marker <= score

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
            {Math.round(score)}
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
        {score >= 90
          ? "Very accessible reading for all ages"
          : score >= 70
            ? "Easily understood by most readers"
            : score >= 50
              ? "Moderate difficulty, requires some focus"
              : "Complex text requiring careful reading"}
      </motion.div>
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

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-background to-secondary/30"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      {/* Decorative background elements */}
      <motion.div
        className="fixed top-20 left-10 w-32 h-32 rounded-full bg-primary/5 blur-3xl"
        animate={floatingAnimation}
      />
      <motion.div
        className="fixed bottom-20 right-10 w-40 h-40 rounded-full bg-primary/5 blur-3xl"
        animate={{
          ...floatingAnimation,
          transition: {
            ...floatingAnimation.transition,
            delay: 1,
          },
        }}
      />

      <motion.header
        className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b"
        variants={headerVariants}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="relative overflow-hidden group">
                <motion.div
                  className="absolute inset-0 bg-primary/10 rounded-md"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
                <ArrowLeft className="h-5 w-5 relative z-10 group-hover:text-primary transition-colors" />
              </Button>
            </Link>
            <motion.h1
              className="text-2xl font-bold relative"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Project Gutenberg Explorer
              <motion.span
                className="absolute -bottom-1 left-0 h-0.5 bg-primary/60 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.7, duration: 0.8 }}
              />
            </motion.h1>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <DarkModeToggle />
          </motion.div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 pt-24 pb-16">
        <motion.div variants={contentVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Book Cover - Fixed Size */}
          <motion.div className="flex justify-center items-start md:sticky md:top-24" variants={itemVariants}>
            <motion.div
              variants={coverVariants}
              whileHover="hover"
              className="w-[300px] h-[450px] rounded-lg overflow-hidden shadow-xl flex-shrink-0 relative"
            >
              {/* Glow effect behind the book */}
              <motion.div
                className="absolute -inset-4 bg-primary/10 rounded-full blur-xl z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />

              <div className="relative w-full h-full bg-muted z-10">
                {book.coverUrl && (
                  <Image
                    src={(sanitizeUrl(book.coverUrl) as string) || "/placeholder.svg"}
                    alt={book.title}
                    width={300}
                    height={450}
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 300px"
                  />
                )}

                {/* Shine effect overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-0"
                  initial={{ opacity: 0, left: "-100%" }}
                  animate={{
                    opacity: [0, 0.3, 0],
                    left: ["0%", "100%", "100%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: 5,
                  }}
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Book Details */}
          <motion.div variants={contentVariants} className="space-y-8">
            <motion.div variants={itemVariants}>
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
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{book.category}</p>
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

                  <motion.div
                    className="flex justify-center mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1, duration: 0.5 }}
                  >
                    <ReadingEaseScore score={book.readingEaseScore} />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-primary/10 shadow-lg"
            >
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

              <motion.p
                className="text-muted-foreground leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.8 }}
              >
                {book.summary}
              </motion.p>
            </motion.div>

            <GenresAndKeywords bookTypes={book.bookTypes} keywords={book.keywords} />

            <motion.div className="flex gap-4 pt-2" variants={itemVariants}>
              <Link href={`/book/${book.id}/read`} target="_blank" rel="noopener noreferrer">
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
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Add the BookChat component */}
        <BookChat bookId={book.id} bookTitle={book.title} />
      </main>
    </motion.div>
  )
}


