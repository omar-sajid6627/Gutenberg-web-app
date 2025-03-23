export interface FeaturedBook {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  readingEaseScore: number | null;
}

export const featuredBooks: FeaturedBook[] = [
  {
    id: "1342",
    title: "Pride and Prejudice",
    author: "Austen, Jane",
    coverUrl: "https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg",
    readingEaseScore: 73.4
  },
  {
    id: "84",
    title: "Frankenstein; Or, The Modern Prometheus",
    author: "Shelley, Mary Wollstonecraft",
    coverUrl: "https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg",
    readingEaseScore: 67.2
  },
  {
    id: "64317",
    title: "The Great Gatsby",
    author: "Fitzgerald, F. Scott (Francis Scott)",
    coverUrl: "https://www.gutenberg.org/cache/epub/64317/pg64317.cover.medium.jpg",
    readingEaseScore: 71.8
  },
  {
    id: "75676",
    title: "Two secrets and A man of his word",
    author: "Stretton, Hesba, 1832-1911",
    coverUrl: "https://www.gutenberg.org/cache/epub/75676/pg75676.cover.medium.jpg",
    readingEaseScore: 82.1
  }
]; 