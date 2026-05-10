/**
 * Horizontal split bar showing input vs output cost share. Quiet, no animation, no
 * tooltip — the labels and percentages are always visible. When both costs are zero we
 * render a single muted track so the layout doesn't jump.
 */
export function CostSplitBar({
  inputUsd,
  outputUsd,
}: {
  inputUsd: number;
  outputUsd: number;
}) {
  const total = inputUsd + outputUsd;
  const inputPct = total > 0 ? (inputUsd / total) * 100 : 0;
  const outputPct = total > 0 ? (outputUsd / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-eyebrow text-(--text-muted)">
        <span>Cost split</span>
        <span className="text-(--text-faint) normal-case tracking-normal">
          {total > 0 ? `${Math.round(inputPct)}% in / ${Math.round(outputPct)}% out` : '—'}
        </span>
      </div>
      <div
        className="flex h-2 w-full overflow-hidden rounded-full bg-(--border)"
        role="img"
        aria-label={
          total > 0
            ? `Input cost ${Math.round(inputPct)} percent, output cost ${Math.round(outputPct)} percent`
            : 'No cost yet'
        }
      >
        {total > 0 && (
          <>
            <div
              className="bg-(--accent)/70"
              style={{ width: `${inputPct}%` }}
              aria-hidden
            />
            <div
              className="bg-(--gold)"
              style={{ width: `${outputPct}%` }}
              aria-hidden
            />
          </>
        )}
      </div>
      <div className="flex items-center gap-4 text-[11px] text-(--text-faint)">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-(--accent)/70" aria-hidden />
          Input
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-(--gold)" aria-hidden />
          Output
        </span>
      </div>
    </div>
  );
}
