import { BookDetails } from './BookDetails';

// Set page to use dynamic rendering (Server-Side Rendering)
export const dynamic = 'force-dynamic';

// Function to extract book types and keywords from subjects
function extractBookInfo(subjects: string[]) {
  const bookTypes = new Set<string>();
  const keywordMap: { [key: string]: Set<string> } = {};

  for (const subject of subjects) {
    if (subject.includes(" -- ")) {
      const parts = subject.split(" -- ");
      const keyword = parts.slice(0, -1).join(" -- ").trim();
      const bookType = parts[parts.length - 1].trim();

      bookTypes.add(bookType);
      if (!keywordMap[bookType]) {
        keywordMap[bookType] = new Set<string>();
      }
      keywordMap[bookType].add(keyword);
    }
  }

  return {
    bookTypes: Array.from(bookTypes),
    keywords: Object.fromEntries(
      Object.entries(keywordMap).map(([type, keywords]) => [
        type, 
        Array.from(keywords)
      ])
    )
  };
}

// Dynamic import to use in server components
async function getBookDetails(id: string) {
  try {
    console.log("Fetching book details for ID:", id);
    const response = await fetch(`http://localhost:8000/books/${id}`, { 
      next: { revalidate: 3600 } // Cache for 1 hour, but allow dynamic updates
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch book: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("API Response for book ID:", id, data);
    
    // Process category field to extract book types and keywords
    const subjects = data.category ? data.category.split(", ") : [];
    const { bookTypes, keywords } = extractBookInfo(subjects);
    
    // Convert the API response to match our component props
    const transformedData = {
      id: data.id,
      title: data.title,
      author: data.author,
      language: data.language || "Unknown",
      category: data.category || "Unknown",
      ebookNo: data.ebook_no,
      releaseDate: data.release_date || "Unknown",
      summary: data.summary,
      coverUrl: data.cover_url || "https://images.unsplash.com/photo-1598618443855-232ee0f819f6?auto=format&fit=crop&q=80",
      downloads: Number(data.downloads) || 0,
      readingEaseScore: data.reading_ease_score === null || data.reading_ease_score === undefined ? null : Number(data.reading_ease_score),
      bookTypes: bookTypes,
      keywords: keywords
    };
    
    return transformedData;
  } catch (error) {
    console.error("Error fetching book details:", error);
    
    // Return fallback data if API fails
    return {
      id,
      title: "Two secrets and A man of his word",
      author: "Stretton, Hesba, 1832-1911",
      language: "English",
      category: "Text",
      ebookNo: "75676",
      releaseDate: "Mar 21, 2025",
      summary: "A compelling tale of secrets and honor, this novel explores themes of trust, integrity, and the power of keeping one's word. Set in Victorian England, the story weaves together the lives of characters whose fates are intertwined through promises made and secrets kept.",
      coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80",
      downloads: 0,
      readingEaseScore: null,
      bookTypes: ["Fiction", "Novel"],
      keywords: {
        "Fiction": ["Historical Fiction", "Victorian Literature"],
        "Novel": ["Moral Tale", "Character Study"]
      }
    };
  }
}

export default async function BookPage({ params }: { params: { id: string } }) {
  const book = await getBookDetails(params.id);
  
  return (
    <BookDetails book={book} />
  );
} 