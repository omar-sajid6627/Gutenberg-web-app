import { BookReader } from './BookReader';
import { API_BASE_URL } from '@/env';

export const dynamic = 'force-dynamic';

// Improved content fetching with format detection
async function getBookContent(id: string) {
  try {
    console.log("Fetching book content for ID:", id); 
    const response = await fetch(`${API_BASE_URL}/books/${id}/content`, { 
      next: { revalidate: 3600 }
    });
    console.log("Response:", response);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch book content: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Book content fetched successfully");

    if (!data?.pages || !Array.isArray(data.pages) || data.pages.length === 0) {
      // Handle fallback content with HTML formatting
      return createFallbackContent(id);
    }
    
    // Process content for better rendering
    const processedPages = data.pages.map((page: string) => {
      // Detect if content is already HTML
      if (/<[a-z][\s\S]*>/i.test(page)) {
        return page; // Return HTML content as is
      }
      
      // Process plain text for better rendering
      // This helps with paragraph spacing and readability
      return page
        .replace(/\n\n+/g, '\n\n') // Normalize paragraph breaks
        .replace(/(?<!\n)\n(?!\n)/g, '  \n'); // Add markdown line breaks
    });
    
    return processedPages;
  } catch (error) {
    console.error("Error fetching book content:", error);
    return createFallbackContent(id);
  }
}

// Create fallback content when book content is not available
async function createFallbackContent(id: string) {
  try {
    // Fetch the book metadata to use as fallback content
    const metadataResponse = await fetch(`${API_BASE_URL}/books/${id}`, {
      next: { revalidate: 3600 }
    });
    
    if (!metadataResponse.ok) {
      throw new Error("Failed to fetch book metadata for fallback content");
    }
    
    const metadata = await metadataResponse.json();
    
    // Create a nicely formatted fallback content using HTML
    const summary = metadata.summary && metadata.summary !== 'N/A' 
      ? metadata.summary 
      : `This book is available in Project Gutenberg's catalog, but the content is not currently available in our system.`;
    
    // Create HTML "pages" with better formatting
    const pages = [
      `<div class="text-center">
        <h1 class="text-3xl font-bold mb-6">${metadata.title}</h1>
        <p class="text-xl mb-8">By ${metadata.author}</p>
        <hr class="my-8 mx-auto w-1/2 border-primary/20" />
        <div class="prose mx-auto">
          <h2 class="text-2xl font-semibold mb-4">Book Summary</h2>
          <p>${summary}</p>
          <p class="mt-6">To read the full book, please visit <a href="https://www.gutenberg.org/ebooks/${metadata.ebook_no}" target="_blank" class="text-primary hover:underline">Project Gutenberg</a>.</p>
        </div>
      </div>`,
      
      `<div class="prose mx-auto">
        <h2 class="text-2xl font-semibold mb-6 text-center">About this Book</h2>
        <ul class="space-y-4 list-none pl-0">
          <li><strong>Language:</strong> ${metadata.language}</li>
          <li><strong>Category:</strong> ${metadata.category || 'Not specified'}</li>
          <li><strong>Release Date:</strong> ${metadata.release_date}</li>
          <li><strong>Downloads:</strong> ${metadata.downloads.toLocaleString()}</li>
          ${metadata.subjects ? `<li><strong>Subjects:</strong> ${metadata.subjects.join(', ')}</li>` : ''}
        </ul>
        <div class="bg-primary/5 p-6 rounded-lg mt-8">
          <p class="italic text-center">This preview was generated because the full content is not available in our system yet.</p>
        </div>
      </div>`
    ];
    
    return pages;
  } catch (error) {
    console.error("Error creating fallback content:", error);
    
    // Return a minimal error message as HTML
    return [
      `<div class="prose mx-auto text-center">
        <h1 class="text-2xl font-bold text-destructive mb-6">Error Loading Content</h1>
        <p class="mb-4">We encountered an error while loading this book's content. This might be because:</p>
        <ul class="list-disc text-left inline-block mb-6">
          <li>The book content is not available yet</li>
          <li>There was a network issue</li>
          <li>The server is currently unavailable</li>
        </ul>
        <p>Please try again later or try another book.</p>
      </div>`
    ];
  }
}

async function getBookMetadata(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, { 
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