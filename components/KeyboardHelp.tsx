'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { events } from '@/lib/analytics';
import { KeyboardIcon, XIcon } from './icons';

/**
 * Global keyboard shortcuts. Lives in the root layout. The intent is "Linear-style
 * navigation for power users without taking over the page" — every shortcut maps to
 * something a mouse user can already do, and the help overlay is one keystroke away.
 *
 *   ?       open this overlay
 *   t       toggle theme
 *   /       focus the prompt textarea (if present on page)
 *   g h     home
 *   g m     models
 *   g p     pricing data
 *   g c     changelog
 *   g a     about
 *   Esc     close overlay
 */
export function KeyboardHelp() {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [open, setOpen] = useState(false);
  const dialogId = useId();
  const router = useRouter();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    let leader: 'g' | null = null;
    let leaderTimer: number | null = null;

    const isTyping = () => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTyping()) return;

      // Leader-key chord: `g` followed by a destination letter within 1.2s.
      if (leader === 'g') {
        const dest: Record<string, string> = {
          h: '/',
          m: '/models',
          p: '/pricing-data',
          c: '/changelog',
          a: '/about',
        };
        const target = dest[e.key.toLowerCase()];
        if (target) {
          e.preventDefault();
          router.push(target);
        }
        leader = null;
        if (leaderTimer) window.clearTimeout(leaderTimer);
        return;
      }

      switch (e.key) {
        case '?':
          e.preventDefault();
          setOpen(true);
          return;
        case 't':
        case 'T': {
          e.preventDefault();
          const cls = document.documentElement.classList;
          const toLight = cls.contains('dark');
          cls.toggle('dark', !toLight);
          cls.toggle('light', toLight);
          try {
            window.localStorage.setItem('theme', toLight ? 'light' : 'dark');
          } catch {
            /* storage disabled — silent */
          }
          events.themeToggled(toLight ? 'light' : 'dark');
          return;
        }
        case '/': {
          const textarea = document.getElementById('main')?.querySelector('textarea');
          if (textarea instanceof HTMLTextAreaElement) {
            e.preventDefault();
            textarea.focus();
          }
          return;
        }
        case 'g':
        case 'G':
          leader = 'g';
          if (leaderTimer) window.clearTimeout(leaderTimer);
          leaderTimer = window.setTimeout(() => {
            leader = null;
          }, 1200);
          return;
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (leaderTimer) window.clearTimeout(leaderTimer);
    };
  }, [router]);

  return (
    <>
      <button
        type="button"
        aria-label="Show keyboard shortcuts"
        aria-controls={dialogId}
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-30 hidden h-10 w-10 items-center justify-center rounded-full border border-(--border) bg-(--surface-2)/90 text-(--text-muted) shadow-[0_4px_16px_rgba(0,0,0,0.25)] backdrop-blur hover:border-(--accent) hover:text-(--text) sm:inline-flex"
      >
        <KeyboardIcon />
      </button>

      <dialog
        id={dialogId}
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === dialogRef.current) setOpen(false);
        }}
        onClose={() => setOpen(false)}
        aria-labelledby={`${dialogId}-title`}
        className="m-auto max-w-md rounded-xl border border-(--border) bg-(--surface-2) p-0 text-(--text) backdrop:bg-black/70"
      >
        <div className="flex items-start justify-between gap-4 border-b border-(--border) px-5 py-4">
          <div>
            <h2 id={`${dialogId}-title`} className="text-base font-semibold tracking-tight">
              Keyboard shortcuts
            </h2>
            <p className="mt-1 text-xs text-(--text-muted)">
              Press <Kbd>?</Kbd> any time to reopen this list.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="-mr-2 -mt-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-(--text-muted) hover:bg-(--bg) hover:text-(--text)"
          >
            <XIcon />
          </button>
        </div>
        <dl className="divide-y divide-(--border)/60">
          <Row keys={['?']} label="Show this overlay" />
          <Row keys={['t']} label="Toggle theme" />
          <Row keys={['/']} label="Focus the prompt textarea" />
          <Row keys={['g', 'h']} label="Go to home" />
          <Row keys={['g', 'm']} label="Go to models" />
          <Row keys={['g', 'p']} label="Go to pricing data" />
          <Row keys={['g', 'c']} label="Go to changelog" />
          <Row keys={['g', 'a']} label="Go to about" />
          <Row keys={['Esc']} label="Close overlays / dialogs" />
        </dl>
      </dialog>
    </>
  );
}

function Row({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
      <span className="text-(--text-muted)">{label}</span>
      <span className="flex items-center gap-1">
        {keys.map((k, i) => (
          <Kbd key={`${k}-${i}`}>{k}</Kbd>
        ))}
      </span>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex min-w-[1.5rem] items-center justify-center rounded border border-(--border) bg-(--bg) px-1.5 py-0.5 font-mono text-xs text-(--text)">
      {children}
    </kbd>
  );
}
