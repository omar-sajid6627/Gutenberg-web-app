"use client"

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  format?: 'markdown' | 'html' | 'plaintext';
  className?: string;
  fontSize?: number;
  lineHeight?: number;
}

/**
 * A versatile content renderer that supports markdown, HTML, and plain text
 */
export function MarkdownRenderer({
  content,
  format = 'markdown',
  className = '',
  fontSize = 16,
  lineHeight = 1.8,
}: MarkdownRendererProps) {
  const [processedContent, setProcessedContent] = useState<string>(content);

  // Process content based on the format
  useEffect(() => {
    if (!content) return;

    // Process the content according to its format
    switch (format) {
      case 'html':
        // HTML is already in the right format for rehype-raw to handle
        setProcessedContent(content);
        break;
      case 'plaintext':
        // Convert plain text newlines to markdown line breaks
        const withLineBreaks = content
          .replace(/\n\n/g, '\n\n')  // Ensure paragraph spacing
          .replace(/(?<!\n)\n(?!\n)/g, '  \n'); // Add markdown line breaks for single newlines
        setProcessedContent(withLineBreaks);
        break;
      case 'markdown':
      default:
        // Default is markdown, so no special processing needed
        setProcessedContent(content);
        break;
    }
  }, [content, format]);

  const getFormatClasses = () => {
    // Base classes for all formats
    let baseClasses = 'prose prose-lg dark:prose-invert max-w-none';
    
    // Format-specific styling
    switch (format) {
      case 'html':
        return `${baseClasses} prose-headings:text-primary prose-a:text-primary`;
      case 'plaintext':
        return `${baseClasses} whitespace-pre-line`;
      case 'markdown':
      default:
        return `${baseClasses} prose-headings:text-primary prose-a:text-primary prose-blockquote:border-l-primary prose-blockquote:border-l-4`;
    }
  };

  // Detect content type if not specified
  useEffect(() => {
    if (format !== 'markdown') return;
    
    // Try to auto-detect if content has markdown or HTML
    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(content);
    const hasMarkdownSyntax = /(\*\*|__|##|>\s|\[.*\]\(.*\))/i.test(content);
    
    if (hasHtmlTags && !hasMarkdownSyntax) {
      console.log('Auto-detected HTML content');
    } else if (!hasHtmlTags && !hasMarkdownSyntax) {
      console.log('Auto-detected plain text content');
    }
  }, [content, format]);

  // Define components with proper typing
  const markdownComponents: Components = {
    h1: ({ node, ...props }) => <h1 className="text-3xl font-serif-reading font-bold mb-6 mt-8" {...props} />,
    h2: ({ node, ...props }) => <h2 className="text-2xl font-serif-reading font-semibold mb-4 mt-6" {...props} />,
    h3: ({ node, ...props }) => <h3 className="text-xl font-serif-reading font-medium mb-3 mt-5" {...props} />,
    p: ({ node, ...props }) => <p className="mb-4 text-foreground/90" {...props} />,
    a: ({ node, ...props }) => <a className="text-primary hover:text-primary/80 underline transition-colors" {...props} />,
    blockquote: ({ node, ...props }) => (
      <blockquote className="border-l-4 border-primary/50 pl-4 italic text-foreground/80" {...props} />
    ),
    ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-2" {...props} />,
    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-2" {...props} />,
    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
    code: ({ node, inline, ...props }) => 
      inline 
        ? <code className="px-1 py-0.5 bg-muted rounded text-sm" {...props} />
        : <code className="block p-4 bg-muted rounded-md overflow-x-auto my-4 text-sm" {...props} />,
    pre: ({ node, ...props }) => <pre className="bg-muted p-0 rounded-md overflow-hidden" {...props} />,
    hr: ({ node, ...props }) => <hr className="my-8 border-primary/20" {...props} />,
    img: ({ node, ...props }) => (
      <img 
        {...props} 
        className="rounded-md shadow-md max-w-full h-auto my-6"
        loading="lazy"
        alt={props.alt || 'Image'} 
      />
    ),
    table: ({ node, ...props }) => (
      <div className="overflow-x-auto my-6">
        <table className="min-w-full divide-y divide-border" {...props} />
      </div>
    ),
    th: ({ node, ...props }) => <th className="px-4 py-3 bg-muted font-medium text-left" {...props} />,
    td: ({ node, ...props }) => <td className="px-4 py-3 border-t border-border" {...props} />,
  };

  return (
    <div 
      className={`${getFormatClasses()} ${className} break-words`}
      style={{ 
        fontSize: `${fontSize}px`, 
        lineHeight: lineHeight,
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={markdownComponents}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
} 