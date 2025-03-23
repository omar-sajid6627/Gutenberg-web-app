import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReadingEase } from '@/components/ReadingEase';

describe('ReadingEase', () => {
  it('says a missing score was not measured instead of inventing one', () => {
    render(<ReadingEase score={null} />);

    expect(screen.getByText(/not measured for this book/i)).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('shows the score with its Flesch band', () => {
    render(<ReadingEase score={64.8} />);

    expect(screen.getByRole('img', { name: /64\.8 out of 100/ })).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
  });
});
