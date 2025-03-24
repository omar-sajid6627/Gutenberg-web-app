"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SearchBar } from "@/components/SearchBar"
import { DarkModeToggle } from "@/components/DarkModeToggle"
import { BookGrid } from "../components/BookGrid"
import { featuredBooks } from "./data/featured-books"
import { Search, X } from "lucide-react"

export default function Home() {
  const [searchVisible, setSearchVisible] = useState(false)

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
      <main className="container mx-auto px-4 pt-28 pb-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-4xl mx-auto mb-16 text-center"
        >
          <motion.h2 variants={itemVariants} className="text-4xl font-serif-reading font-bold mb-4">
            Discover Classic Literature
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore thousands of free books from the world's greatest authors
          </motion.p>

          {/* Animated Glowing Search Icon / Search Bar */}
          <AnimatePresence mode="wait">
            {searchVisible ? (
              <motion.div
                key="searchBar"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
                className="w-full max-w-md mx-auto relative"
              >
                <SearchBar />
                {/* Close Button */}
                <motion.button
                  onClick={toggleSearch}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute -top-3 -right-3 p-2 bg-white rounded-full shadow-md"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5 text-primary" />
                </motion.button>
              </motion.div>
            ) : (
              <motion.button
                key="searchIcon"
                onClick={toggleSearch}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="mx-auto flex items-center justify-center p-4 rounded-full bg-primary/10 text-primary shadow-lg"
                style={{ animation: "glowShift 2s ease-in-out infinite" }}
                aria-label="Open search"
              >
                <Search className="h-8 w-8" />
              </motion.button>
            )}
          </AnimatePresence>
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
              Featured Books
            </motion.h2>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm font-medium text-primary hover:underline"
              >
                View all
              </motion.button>
            </motion.div>
          </div>
          <BookGrid books={featuredBooks} />
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
