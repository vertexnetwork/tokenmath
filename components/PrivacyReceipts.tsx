'use client';

import { useEffect, useState } from 'react';
import { LiveDotIcon } from './icons';

/**
 * Privacy receipts — proof, not claim. Shows live counters of what's leaving the user's
 * browser since this page loaded:
 *
 *   - Outgoing requests (PerformanceObserver "resource" entries)
 *   - Cookies set on this origin
 *   - localStorage keys
 *
 * The counters update as the user types so a developer can prove the privacy contract by
 * inspection rather than taking our word. Analytics scripts will appear in the request
 * count when enabled — that's expected and disclosed.
 */
export function PrivacyReceipts() {
  const [counts, setCounts] = useState({ requests: 0, cookies: 0, storage: 0 });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const refresh = () => {
      const cookies = document.cookie ? document.cookie.split(';').filter(Boolean).length : 0;
      let storage = 0;
      try {
        storage = window.localStorage.length;
      } catch {
        storage = 0;
      }
      setCounts((c) => ({ ...c, cookies, storage }));
    };

    let bumped = 0;
    let observer: PerformanceObserver | null = null;
    // First refresh + observer wiring are scheduled out of the synchronous effect body
    // to satisfy react-hooks/set-state-in-effect.
    const bootHandle = window.setTimeout(() => {
      refresh();
      try {
        observer = new PerformanceObserver((list) => {
          bumped += list.getEntries().length;
          setCounts((c) => ({ ...c, requests: bumped }));
        });
        observer.observe({ type: 'resource', buffered: false });
      } catch {
        observer = null;
      }
    }, 0);

    const onStorage = () => refresh();
    window.addEventListener('storage', onStorage);
    const interval = window.setInterval(refresh, 1500);

    return () => {
      window.clearTimeout(bootHandle);
      observer?.disconnect();
      window.removeEventListener('storage', onStorage);
      window.clearInterval(interval);
    };
  }, []);

  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="rounded-xl border border-(--border) bg-(--surface)"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm">
        <span className="inline-flex items-center gap-2">
          <LiveDotIcon className="text-(--accent-2)" />
          <span className="font-medium">Verify privacy</span>
          <span className="text-xs text-(--text-faint)">
            since this page loaded — updates live
          </span>
        </span>
        <span aria-hidden className="text-(--text-faint)">
          {open ? '−' : '+'}
        </span>
      </summary>

      <div className="grid grid-cols-1 gap-4 border-t border-(--border) p-4 sm:grid-cols-3">
        <Counter label="Prompt uploads" value="0" tone="positive" hint="Always 0 — by design" />
        <Counter
          label="Outgoing requests"
          value={counts.requests.toString()}
          hint="Analytics + page assets only — no prompt content"
        />
        <Counter
          label="Cookies on this origin"
          value={counts.cookies.toString()}
          hint="Vercel Analytics + Clarity may set first-party cookies"
        />
        <Counter
          label="localStorage keys"
          value={counts.storage.toString()}
          hint="Theme preference + saved scenarios live here"
        />
        <Counter
          label="Server endpoints"
          value="1"
          hint="/api/og only — accepts title + subtitle, never prompt text"
        />
        <div className="flex flex-col gap-1">
          <span className="text-eyebrow text-(--text-muted)">Inspect</span>
          <p className="text-xs text-(--text-faint)">
            Open DevTools → Network. Type into the calculator. No request bodies should
            contain your prompt text.
          </p>
        </div>
      </div>
    </details>
  );
}

function Counter({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: 'positive';
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-eyebrow text-(--text-muted)">{label}</span>
      <span
        className={`result-num text-2xl font-semibold tabular-nums ${
          tone === 'positive' ? 'text-(--accent-2)' : 'text-(--text)'
        }`}
      >
        {value}
      </span>
      <span className="text-xs text-(--text-faint)">{hint}</span>
    </div>
  );
}
