"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SearchBar } from "@/components/SearchBar"
import { DarkModeToggle } from "@/components/DarkModeToggle"
import { BookGrid } from "../components/BookGrid"
import { Search, X } from "lucide-react"

interface RecentBook {
  id: string
  title: string
  author: string
  coverUrl: string | null
  readingEaseScore: number | null
}

export default function Home() {
  const [searchVisible, setSearchVisible] = useState(false)
  const [recentBooks, setRecentBooks] = useState<RecentBook[]>([])

  useEffect(() => {
    // Load recently viewed books from localStorage
    const savedBooks = localStorage.getItem('recentBooks')
    if (savedBooks) {
      setRecentBooks(JSON.parse(savedBooks))
    }
  }, [])

  const toggleSearch = () => {
    setSearchVisible((prev) => !prev)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-secondary/30">
      {/* Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b shadow-sm"
      >
        <div className="container mx-auto px-4 h-16 flex items-center">
          {/* Left: Title */}
          <div className="flex-shrink-0">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
            >
              Project Gutenberg Explorer
            </motion.h1>
          </div>
          {/* Right: Dark Mode Toggle Only */}
          <div className="flex-shrink-0 ml-auto">
            <DarkModeToggle />
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center min-h-[60vh] relative"
        >
          <motion.div
            variants={itemVariants}
            className="text-center space-y-6 max-w-2xl mx-auto"
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-5xl font-serif-reading font-bold"
            >
              Project Gutenberg Explorer
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-lg text-muted-foreground"
            >
              Discover and read thousands of free books from Project Gutenberg
            </motion.p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="w-full max-w-2xl mt-8"
          >
            <SearchBar />
          </motion.div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, type: "spring" }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-8">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="text-2xl font-serif-reading font-semibold"
            >
              Recently Viewed
            </motion.h2>
            {recentBooks.length > 0 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View all
                </motion.button>
              </motion.div>
            )}
          </div>
          {recentBooks.length > 0 ? (
            <BookGrid books={recentBooks} />
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-muted-foreground"
            >
              No recently viewed books yet. Start exploring!
            </motion.p>
          )}
        </motion.section>
      </main>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="border-t py-6 bg-background/50 backdrop-blur-sm"
      >
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Project Gutenberg Explorer. All books are in the public domain.</p>
        </div>
      </motion.footer>
    </div>
  )
}
