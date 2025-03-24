import { BookReader } from './BookReader';

export const dynamic = 'force-dynamic';

async function getBookContent(id: string) {
  try {
    console.log("Fetching book content for ID:", id);
    const response = await fetch(`http://localhost:8000/books/${id}/content`, { 
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch book content: ${response.status}`);
    }
    
    const data = await response.json();

    if (!data?.pages || !Array.isArray(data.pages) || data.pages.length === 0) {
      throw new Error("No pages found in the response");
    }
    
    // Return only the first page
    console.log("DATA",data.pages?.[0])
    return data.pages
  } catch (error) {
    console.error("Error fetching book content:", error);
    return null;
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
  
  if (!metadata || !content) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>Failed to load book content. Please try again later.</p>
      </div>
    );
  }
  
  return <BookReader book={{ ...metadata, content }} />;
} 