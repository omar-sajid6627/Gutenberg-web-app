"use client"

import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

export type ContentFormat = 'markdown' | 'html' | 'plaintext';

interface MarkdownRendererProps {
  content: string;
  format?: ContentFormat;
  className?: string;
  fontSize?: number;
  lineHeight?: number;
}

export function detectContentFormat(content: string): ContentFormat {
  if (!content) return 'plaintext';
  if (/<[a-z][\s\S]*>/i.test(content)) return 'html';
  if (/(\*\*|__|##|>\s|\[.*\]\(.*\))/i.test(content)) return 'markdown';
  return 'plaintext';
}

/**
 * Gutenberg plain text is hard-wrapped at about 70 characters. Keeping those
 * line breaks made every paragraph ragged inside a narrower column, so single
 * newlines are joined and only blank lines separate paragraphs.
 */
export function reflowPlainText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/(?<!\n)\n(?!\n)/g, ' ');
}

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
  pre: ({ node, ...props }) => <pre className="bg-muted p-4 rounded-md overflow-x-auto my-4 text-sm" {...props} />,
  hr: ({ node, ...props }) => <hr className="my-8 border-primary/20" {...props} />,
  img: ({ node, alt, ...props }) => (
    // Book illustrations come from arbitrary hosts with unknown sizes, which
    // next/image cannot optimise without a domain allowlist.
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={alt ?? ''} className="rounded-md shadow-md max-w-full h-auto my-6" loading="lazy" />
  ),
  table: ({ node, ...props }) => (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full divide-y divide-border" {...props} />
    </div>
  ),
  th: ({ node, ...props }) => <th className="px-4 py-3 bg-muted font-medium text-left" {...props} />,
  td: ({ node, ...props }) => <td className="px-4 py-3 border-t border-border" {...props} />,
};

/** Renders a page of book text that may be markdown, HTML or plain text. */
export function MarkdownRenderer({
  content,
  format = 'markdown',
  className = '',
  fontSize = 16,
  lineHeight = 1.8,
}: MarkdownRendererProps) {
  const source = useMemo(
    () => (format === 'plaintext' ? reflowPlainText(content) : content),
    [content, format],
  );

  return (
    <div className={`${className} break-words`} style={{ fontSize: `${fontSize}px`, lineHeight }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={markdownComponents}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
