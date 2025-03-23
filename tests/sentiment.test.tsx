import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SentimentOverview } from '@/app/components/sentimentAnalysis';
import type { SentimentResult } from '@/app/hooks/useSentiment';
import { fixtures } from './fixtures';

describe('SentimentOverview', () => {
  it('reports a running analysis instead of the placeholder neutral score', async () => {
    const onRetry = vi.fn();
    render(<SentimentOverview state={{ kind: 'processing' }} onRetry={onRetry} />);

    expect(screen.getByText(/analysis is running/i)).toBeInTheDocument();
    expect(screen.queryByText(/neutral/i)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /check again/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('shows the overall tone and compound score of a finished analysis', () => {
    const data = fixtures['84'].sentiment as SentimentResult;
    render(<SentimentOverview state={{ kind: 'ready', data }} onRetry={() => undefined} />);

    expect(screen.getByText('negative')).toBeInTheDocument();
    expect(screen.getByText('-0.92')).toBeInTheDocument();
  });

  it('offers a retry when the analysis failed', () => {
    render(
      <SentimentOverview state={{ kind: 'error', message: 'The analysis service answered 502' }} onRetry={() => undefined} />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('The analysis service answered 502');
  });
});
