export interface BookView {
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
  bookTypes: string[]
  keywords: Record<string, string[]>
}

/** The book record as the backend's `GET /books/{id}` returns it. */
export interface ApiBook {
  id: string
  title: string
  author: string
  language?: string | null
  category?: string | null
  ebook_no: string
  release_date?: string | null
  summary?: string | null
  cover_url?: string | null
  downloads?: number | string | null
}

/**
 * Gutenberg subjects look like "Courtship -- Fiction" or
 * "England -- Social life and customs -- 19th century -- Fiction".
 * The last segment is the form (Fiction, Drama, Periodicals…), the rest is
 * the topic. Subjects without " -- " carry no form and are skipped.
 */
export function extractBookInfo(subjects: string[]) {
  const keywordMap = new Map<string, Set<string>>()

  for (const subject of subjects) {
    if (!subject.includes(" -- ")) continue
    const parts = subject.split(" -- ")
    const bookType = parts[parts.length - 1].trim()
    const keyword = parts.slice(0, -1).join(" -- ").trim()

    if (!keywordMap.has(bookType)) keywordMap.set(bookType, new Set())
    keywordMap.get(bookType)!.add(keyword)
  }

  return {
    bookTypes: Array.from(keywordMap.keys()),
    keywords: Object.fromEntries(
      Array.from(keywordMap, ([type, words]) => [type, Array.from(words)]),
    ),
  }
}

export function toBookView(data: ApiBook, readingEaseScore: number | null): BookView {
  const subjects = data.category ? data.category.split(", ") : []
  const { bookTypes, keywords } = extractBookInfo(subjects)

  return {
    id: data.id,
    title: data.title,
    author: data.author,
    language: data.language || "Unknown",
    category: data.category || "Unknown",
    ebookNo: data.ebook_no,
    releaseDate: data.release_date || "Unknown",
    summary: data.summary && data.summary !== "N/A" ? data.summary : "",
    coverUrl: data.cover_url || null,
    downloads: Number(data.downloads) || 0,
    readingEaseScore,
    bookTypes,
    keywords,
  }
}

export interface ReadingEaseBand {
  label: string
  description: string
}

/**
 * The bands of Flesch's original table, so the label next to the score means
 * what the score's author meant by it.
 */
export function readingEaseBand(score: number): ReadingEaseBand {
  if (score >= 90) return { label: "Very easy", description: "Readable by an average 11-year-old" }
  if (score >= 80) return { label: "Easy", description: "Conversational English" }
  if (score >= 70) return { label: "Fairly easy", description: "Comfortable for most adult readers" }
  if (score >= 60) return { label: "Standard", description: "Plain English for a general audience" }
  if (score >= 50) return { label: "Fairly difficult", description: "Long sentences; rewards some focus" }
  if (score >= 30) return { label: "Difficult", description: "Dense, academic-level prose" }
  return { label: "Very difficult", description: "Best read slowly, with a dictionary nearby" }
}
