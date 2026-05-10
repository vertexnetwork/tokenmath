'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { events } from '@/lib/analytics';

type SisterSite = {
  name: string;
  href: string;
  blurb: string;
};

const SISTER_SITES: SisterSite[] = [
  {
    name: 'Shopifont',
    href: 'https://shopifont.app',
    blurb:
      'Generates @font-face CSS, settings JSON, and CSS overrides for adding custom fonts to Shopify OS 2.0 themes.',
  },
  {
    name: 'Etsy Margin Tools',
    href: 'https://etsymargin.tools',
    blurb:
      'Calculates true Etsy profit after listing fees, transaction fees, payment processing, and off-site ads.',
  },
  {
    name: 'CaptionSnap',
    href: 'https://captionsnap.io',
    blurb:
      'Paste ad copy, see exactly where it gets truncated across 42 placements on 8 ad platforms.',
  },
  {
    name: 'KDP Cover Pro',
    href: 'https://kdpcover.pro',
    blurb:
      'Calculates spine width and full-cover dimensions for KDP books from page count, format, and paper type.',
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-(--border)">
      <div className="mx-auto flex w-full max-w-(--container-app) flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-(--text-muted)">
          tokenmath — accurate token math for Claude, Gemini, and OpenAI.
        </p>
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-(--text-muted)">
          <li>
            <Link href="/about" className="hover:text-(--text)">
              About
            </Link>
          </li>
          <li>
            <Link href="/privacy" className="hover:text-(--text)">
              Privacy
            </Link>
          </li>
          <li>
            <Link href="/pricing-data" className="hover:text-(--text)">
              Pricing data
            </Link>
          </li>
          <li>
            <a href="mailto:hello@tokenmath.dev" className="hover:text-(--text)">
              hello@tokenmath.dev
            </a>
          </li>
        </ul>
      </div>
      <VertexLink />
    </footer>
  );
}

function VertexLink() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const dialogId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleDialogClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) setOpen(false);
  };

  return (
    <div className="border-t border-(--border)/50 py-4 text-center">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-controls={dialogId}
        onClick={() => {
          events.vertexFooterOpened();
          setOpen(true);
        }}
        className="text-xs text-(--text-muted)/60 underline-offset-4 hover:text-(--text-muted) hover:underline"
      >
        Part of the Vertex Network
      </button>

      <dialog
        id={dialogId}
        ref={dialogRef}
        onClick={handleDialogClick}
        onClose={() => setOpen(false)}
        aria-labelledby={`${dialogId}-title`}
        className="m-auto max-w-md rounded-xl border border-(--border) bg-(--surface) p-0 text-(--text) backdrop:bg-black/60"
      >
        <div className="flex items-start justify-between gap-4 border-b border-(--border) px-5 py-4">
          <div>
            <h2 id={`${dialogId}-title`} className="text-base font-semibold tracking-tight">
              Vertex Network
            </h2>
            <p className="mt-1 text-xs text-(--text-muted)">
              Indie tools built on the same stack. Each runs independently.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="-mr-2 -mt-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-(--text-muted) hover:bg-(--bg) hover:text-(--text)"
          >
            <span aria-hidden>×</span>
          </button>
        </div>
        <ul className="divide-y divide-(--border)">
          {SISTER_SITES.map((site) => (
            <li key={site.href}>
              <a
                href={site.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-5 py-4 hover:bg-(--bg)"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{site.name}</span>
                  <span className="text-xs text-(--text-muted)">{new URL(site.href).host}</span>
                </div>
                <p className="mt-1 text-xs text-(--text-muted)">{site.blurb}</p>
              </a>
            </li>
          ))}
        </ul>
      </dialog>
    </div>
  );
}
