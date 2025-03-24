import { BookReader } from './BookReader';

export const dynamic = 'force-dynamic';

async function getBookContent(id: string) {
  try {
    console.log("Fetching book content for ID:", id); 
    const response = await fetch(`http://localhost:8000/books/${id}/content`, { 
      next: { revalidate: 3600 }
    });
    console.log("Response:", response);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch book content: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Book content:", data);

    // Check if API returns null (no content available)
    if (data === null) {
      console.log("No content available from API, will use fallback");
      // Fetch the book summary to use as fallback content
      const metadataResponse = await fetch(`http://localhost:8000/books/${id}`, {
        next: { revalidate: 3600 }
      });
      
      if (!metadataResponse.ok) {
        throw new Error("Failed to fetch book metadata for fallback content");
      }
      
      const metadata = await metadataResponse.json();
      
      // Create a simple fallback content using the book's summary or description
      // Split the summary into paragraphs or create a note if summary is not available
      const summary = metadata.summary && metadata.summary !== 'N/A' 
        ? metadata.summary 
        : `This book (${metadata.title} by ${metadata.author}) is available in Project Gutenberg's catalog, but the content is not currently available in our system.`;
      
      // Create a few "pages" with content
      const pages = [
        `<h1>${metadata.title}</h1><p>By ${metadata.author}</p><p>${summary}</p><p>To read the full book, please visit <a href="https://www.gutenberg.org/ebooks/${metadata.ebook_no}" target="_blank">Project Gutenberg</a>.</p>`,
        `<h2>About this book</h2><p>Language: ${metadata.language}</p><p>Category: ${metadata.category}</p><p>Release Date: ${metadata.release_date}</p><p>Downloads: ${metadata.downloads}</p>`,
        `<p>This preview was generated because the full content is not available in our system yet.</p>`
      ];
      
      return pages;
    }

    if (!data?.pages || !Array.isArray(data.pages) || data.pages.length === 0) {
      throw new Error("No pages found in the response");
    }
    
    return data.pages;
  } catch (error) {
    console.error("Error fetching book content:", error);
    
    // Return a minimal fallback content array in case of any error
    return [
      "<h1>Error Loading Content</h1><p>We encountered an error while loading this book's content. This might be because:</p><ul><li>The book content is not available yet</li><li>There was a network issue</li><li>The server is currently unavailable</li></ul><p>Please try again later or try another book.</p>"
    ];
  }
}

async function getBookMetadata(id: string) {
  try {
    const response = await fetch(`http://localhost:8000/books/${id}`, { 
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch book metadata: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error("Error fetching book metadata:", error);
    return null;
  }
}

export default async function ReadBookPage({ params }: { params: { id: string } }) {
  const [metadata, content] = await Promise.all([
    getBookMetadata(params.id),
    getBookContent(params.id)
  ]);
  
  if (!metadata) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>Failed to load book metadata. Please try again later.</p>
      </div>
    );
  }
  
  return <BookReader book={{ ...metadata, content }} />;
} 