/**
 * Editorial wordmark. Two design moves:
 *   1. Lowercase Inter at 600 weight with negative tracking — reads as a typeset wordmark,
 *      not a placeholder string.
 *   2. Mauve brackets that flank the word, evoking [tokens] without leaning on a glyph.
 *
 * Used in Header (full word) and as the favicon SVG (just the [t] monogram).
 */
export function Wordmark({
  className = '',
  size = 'md',
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const dims = {
    sm: { wrap: 'text-sm gap-1', bracket: 'text-[0.95em]' },
    md: { wrap: 'text-base gap-1.5', bracket: 'text-[0.9em]' },
    lg: { wrap: 'text-2xl gap-2', bracket: 'text-[0.85em]' },
  }[size];

  return (
    <span className={`inline-flex items-baseline ${dims.wrap} ${className}`} aria-label="tokenmath">
      <span aria-hidden className={`font-mono font-medium text-(--accent) ${dims.bracket}`}>
        [
      </span>
      <span className="font-semibold tracking-[-0.025em] text-(--text)">tokenmath</span>
      <span aria-hidden className={`font-mono font-medium text-(--accent) ${dims.bracket}`}>
        ]
      </span>
    </span>
  );
}
