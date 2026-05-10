/**
 * Single horizontal meter showing input-token usage vs the model's context window. Goes
 * amber at 75% of capacity and red above 100% — the user's headline cue that a swap to a
 * wider-context model is needed before the API rejects the request.
 */
export function ContextMeter({
  inputTokens,
  contextWindow,
}: {
  inputTokens: number;
  contextWindow: number;
}) {
  const ratio = inputTokens / contextWindow;
  const pct = Math.min(100, Math.round(ratio * 100));
  const tone =
    ratio >= 1
      ? { bar: "bg-amber-400", text: "text-amber-300", label: "Over" }
      : ratio >= 0.75
        ? { bar: "bg-amber-400/70", text: "text-amber-300/90", label: "Near limit" }
        : { bar: "bg-(--accent)/70", text: "text-(--text-faint)", label: "" };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-eyebrow text-(--text-muted)">
        <span>Context</span>
        <span className={`${tone.text} normal-case tracking-normal`}>
          {pct}%{tone.label && ` · ${tone.label}`}
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-(--border)"
        role="img"
        aria-label={`${pct} percent of context window used`}
      >
        <div className={`h-full ${tone.bar}`} style={{ width: `${pct}%` }} aria-hidden />
      </div>
    </div>
  );
}
