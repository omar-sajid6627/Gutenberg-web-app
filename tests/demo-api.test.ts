import { describe, expect, it } from 'vitest';
import { answerFromText } from '@/scripts/demo-api.mjs';
import { fixtures } from './fixtures';

describe('demo API answers', () => {
  const pages = fixtures['1342'].content.pages;

  it('answers from the sentences that share words with the question', () => {
    const answer: string = answerFromText(pages, 'Who has taken Netherfield Park?');

    expect(answer).toContain('Netherfield is taken by a young man of large fortune');
    expect(answer).toContain('Mr. Morris immediately');
  });

  it('says so when the excerpt does not cover the question', () => {
    expect(answerFromText(pages, 'zeppelin')).toMatch(/does not mention that/);
  });
});
