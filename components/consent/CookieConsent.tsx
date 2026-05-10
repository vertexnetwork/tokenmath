"use client";

import Link from "next/link";
import { useConsent } from "./ConsentProvider";

/**
 * Single-row banner. Renders only when consent is 'unknown'. Once the user accepts
 * or declines, the choice persists in localStorage and the banner stays gone.
 */
export function CookieConsent() {
  const { state, grant, deny } = useConsent();
  if (state !== "unknown") return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-(--border) bg-(--surface)/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-(--container-app) flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-(--text-muted)">
          We use Vercel Web Analytics for aggregate page metrics and (optionally) Microsoft Clarity
          for masked session replay. Prompt content is never sent.{" "}
          <Link href="/privacy" className="text-(--accent) underline underline-offset-4">
            Read the privacy policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={deny}
            className="inline-flex h-9 items-center rounded-md border border-(--border) px-3 text-sm text-(--text-muted) hover:bg-(--bg) hover:text-(--text)"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={grant}
            className="inline-flex h-9 items-center rounded-md bg-(--accent) px-3 text-sm font-medium text-(--bg) hover:opacity-90"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
