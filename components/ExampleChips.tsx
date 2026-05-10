'use client';

import { EXAMPLE_PRESETS, type ExamplePreset } from '@/lib/examples';

/**
 * Empty-state preset chips. Shown above the textarea when input is empty so a first-time
 * visitor can see a real result in one click without having to find their own prompt.
 */
export function ExampleChips({ onPick }: { onPick: (preset: ExamplePreset) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-eyebrow text-(--text-faint)">Or start with an example</span>
      <div className="flex flex-wrap gap-2">
        {EXAMPLE_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPick(p)}
            className="group inline-flex items-baseline gap-2 rounded-full border border-(--border) bg-(--surface) px-3 py-1.5 text-xs text-(--text-muted) transition-colors hover:border-(--accent) hover:text-(--text)"
          >
            <span className="font-medium text-(--text)">{p.label}</span>
            <span className="text-(--text-faint) group-hover:text-(--text-muted)">
              {p.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
