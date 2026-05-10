"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Sticky bottom bar shown on mobile when the result card has scrolled out of view. Keeps
 * the answer in the user's eye line while they edit a long prompt. We use
 * IntersectionObserver against the result card so the bar appears/disappears smoothly
 * and only when needed.
 */
export function MobileTotalBar({
  total,
  modelLabel,
  visible,
  observeId,
}: {
  total: string;
  modelLabel: string;
  visible: boolean;
  observeId: string;
}) {
  const [resultInView, setResultInView] = useState(true);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = document.getElementById(observeId);
    if (!target) return;
    const obs = new IntersectionObserver(([entry]) => setResultInView(entry.isIntersecting), {
      threshold: 0.1,
    });
    obs.observe(target);
    return () => obs.disconnect();
  }, [observeId]);

  const show = visible && !resultInView;

  return (
    <div
      ref={ref}
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-0 z-20 border-t border-(--border) bg-(--surface-2)/95 backdrop-blur transition-transform sm:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto flex w-full max-w-(--container-app) items-center justify-between gap-3 px-6 py-3">
        <span className="truncate text-xs text-(--text-muted)">{modelLabel}</span>
        <span className="result-num text-base font-semibold text-(--gold)" data-clarity-mask="true">
          {total}
        </span>
      </div>
    </div>
  );
}
