import { beforeEach, describe, expect, it } from 'vitest';
import { MAX_RECENT_BOOKS, displayAuthor, loadRecentBooks, rememberBook } from '@/lib/recent-books';

beforeEach(() => window.localStorage.clear());

const book = (id: string) => ({ id, title: `Book ${id}`, author: 'Austen, Jane, 1775-1817', coverUrl: null });

describe('recent books', () => {
  it('puts the latest book first without duplicates and keeps six', () => {
    for (const id of ['1', '2', '3', '4', '5', '6', '7']) rememberBook(book(id));
    rememberBook(book('4'));

    const ids = loadRecentBooks().map((b) => b.id);
    expect(ids).toEqual(['4', '7', '6', '5', '3', '2']);
    expect(ids).toHaveLength(MAX_RECENT_BOOKS);
  });

  it('reads corrupt or foreign storage as an empty shelf', () => {
    window.localStorage.setItem('recentBooks', '{not json');
    expect(loadRecentBooks()).toEqual([]);

    window.localStorage.setItem('recentBooks', JSON.stringify([{ id: 1 }, book('84')]));
    expect(loadRecentBooks().map((b) => b.id)).toEqual(['84']);
  });
});

describe('displayAuthor', () => {
  it.each([
    ['Austen, Jane, 1775-1817', 'Jane Austen'],
    ['Shelley, Mary Wollstonecraft, 1797-1851', 'Mary Wollstonecraft Shelley'],
    ['Fitzgerald, F. Scott (Francis Scott), 1896-1940', 'F. Scott Fitzgerald'],
    ['Homer', 'Homer'],
  ])('turns %s into %s', (catalogue, spoken) => {
    expect(displayAuthor(catalogue)).toBe(spoken);
  });
});
