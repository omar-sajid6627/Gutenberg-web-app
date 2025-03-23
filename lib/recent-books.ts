export interface RecentBook {
  id: string
  title: string
  author: string
  coverUrl: string | null
}

const STORAGE_KEY = "recentBooks"
export const MAX_RECENT_BOOKS = 6

function isRecentBook(value: unknown): value is RecentBook {
  if (!value || typeof value !== "object") return false
  const book = value as Record<string, unknown>
  return typeof book.id === "string" && typeof book.title === "string" && typeof book.author === "string"
}

/** Recently opened books, newest first. Corrupt storage reads as empty. */
export function loadRecentBooks(storage: Storage = window.localStorage): RecentBook[] {
  try {
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY) ?? "[]")
    return Array.isArray(parsed) ? parsed.filter(isRecentBook) : []
  } catch {
    return []
  }
}

export function rememberBook(book: RecentBook, storage: Storage = window.localStorage): RecentBook[] {
  const entry: RecentBook = { id: book.id, title: book.title, author: book.author, coverUrl: book.coverUrl }
  const books = [entry, ...loadRecentBooks(storage).filter((b) => b.id !== book.id)].slice(0, MAX_RECENT_BOOKS)
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(books))
  } catch {
    // Storage full or disabled (private mode): the shelf is a convenience.
  }
  return books
}

/** "Austen, Jane, 1775-1817" -> "Jane Austen", the way a reader says it. */
export function displayAuthor(author: string): string {
  const parts = author.split(",").map((part) => part.replace(/\s*\(.*?\)/g, "").trim())
  const named = parts.filter((part) => part && !/^-?\d/.test(part))
  if (named.length === 2) return `${named[1]} ${named[0]}`
  return named.join(", ") || author
}

/** A stable hue per book so typeset covers on a shelf are not all one colour. */
export function coverHue(id: string): number {
  const hues = [14, 172, 38, 350, 200, 95]
  let sum = 0
  for (const char of id) sum += char.charCodeAt(0)
  return hues[sum % hues.length]
}
