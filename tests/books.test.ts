import { describe, expect, it } from 'vitest';
import { extractBookInfo, readingEaseBand, toBookView } from '@/lib/books';
import { fixtures } from './fixtures';

describe('extractBookInfo', () => {
  it('groups subject topics under their form', () => {
    const info = extractBookInfo([
      'Courtship -- Fiction',
      'England -- Social life and customs -- 19th century -- Fiction',
      'Domestic fiction',
      'Sisters -- Fiction',
    ]);

    expect(info.bookTypes).toEqual(['Fiction']);
    expect(info.keywords.Fiction).toEqual([
      'Courtship',
      'England -- Social life and customs -- 19th century',
      'Sisters',
    ]);
  });

  it('returns nothing for subjects without a form', () => {
    expect(extractBookInfo(['Love stories'])).toEqual({ bookTypes: [], keywords: {} });
  });
});

describe('toBookView', () => {
  it('maps the API record and keeps a missing score as null', () => {
    const view = toBookView(fixtures['1342'].book, null);

    expect(view).toMatchObject({
      id: '1342',
      title: 'Pride and Prejudice',
      ebookNo: '1342',
      coverUrl: null,
      downloads: 58617,
      readingEaseScore: null,
    });
    expect(view.bookTypes).toContain('Fiction');
  });

  it('treats the backend "N/A" summary as no summary and coerces downloads', () => {
    const view = toBookView({ ...fixtures['84'].book, summary: 'N/A', downloads: '12' }, 54.3);

    expect(view.summary).toBe('');
    expect(view.downloads).toBe(12);
    expect(view.readingEaseScore).toBe(54.3);
  });
});

describe('readingEaseBand', () => {
  it.each([
    [95, 'Very easy'],
    [80, 'Easy'],
    [78.9, 'Fairly easy'],
    [64.8, 'Standard'],
    [54.3, 'Fairly difficult'],
    [30, 'Difficult'],
    [12, 'Very difficult'],
  ])('labels %d as %s', (score, label) => {
    expect(readingEaseBand(score).label).toBe(label);
  });
});
