import { readingEaseBand } from '@/lib/books';

/**
 * Flesch Reading Ease as a dial. null means the backend could not measure
 * the text, and is shown as such; a score is never filled in.
 */
export function ReadingEase({ score }: { score: number | null }) {
  if (score === null || Number.isNaN(score)) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <h2 className="font-serif text-xl font-semibold">Reading ease</h2>
        <p className="mt-2 text-muted-foreground">Not measured for this book.</p>
      </div>
    );
  }

  const band = readingEaseBand(score);
  const clamped = Math.min(Math.max(score, 0), 100);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-6 rounded-lg border bg-card p-6">
      <svg viewBox="0 0 100 100" className="h-28 w-28 shrink-0" role="img" aria-label={`Flesch reading ease ${score.toFixed(1)} out of 100`}>
        <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          transform="rotate(-90 50 50)"
        />
        <text x="50" y="56" textAnchor="middle" className="fill-foreground font-serif text-[22px] font-semibold">
          {score.toFixed(1)}
        </text>
      </svg>
      <div>
        <h2 className="font-serif text-xl font-semibold">Reading ease</h2>
        <p className="mt-1 text-lg font-medium text-secondary">{band.label}</p>
        <p className="text-sm text-muted-foreground">{band.description}</p>
        <p className="mt-2 text-xs text-muted-foreground">Flesch score, 0 (hardest) to 100 (easiest)</p>
      </div>
    </div>
  );
}
