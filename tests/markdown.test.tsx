import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarkdownRenderer, detectContentFormat, reflowPlainText } from '@/app/components/MarkdownRenderer';
import { fixtures } from './fixtures';

describe('detectContentFormat', () => {
  it('tells HTML, markdown and plain text apart', () => {
    expect(detectContentFormat('<p>Chapter</p>')).toBe('html');
    expect(detectContentFormat('## Chapter I')).toBe('markdown');
    expect(detectContentFormat(fixtures['1342'].content.pages[0])).toBe('plaintext');
  });
});

describe('reflowPlainText', () => {
  it('joins hard-wrapped lines and keeps paragraph breaks', () => {
    expect(reflowPlainText('It is a truth\nuniversally acknowledged.\n\n\n\nMr. Bennet')).toBe(
      'It is a truth universally acknowledged.\n\nMr. Bennet',
    );
  });
});

describe('MarkdownRenderer', () => {
  it('renders a Gutenberg page as reflowed paragraphs', () => {
    const { container } = render(
      <MarkdownRenderer content={fixtures['1342'].content.pages[0]} format="plaintext" />,
    );

    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs[1].textContent).toBe(
      'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.',
    );
  });

  it('strips scripts and event handlers from HTML pages', () => {
    const { container } = render(
      <MarkdownRenderer content={'<p onclick="alert(1)">Safe</p><script>alert(1)</script>'} format="html" />,
    );

    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('[onclick]')).toBeNull();
    expect(container.textContent).toContain('Safe');
  });
});
