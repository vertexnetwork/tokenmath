'use client';

import { events, type AffiliatePlacement } from '@/lib/analytics';

const RUNPOD_REF_URL = process.env.NEXT_PUBLIC_RUNPOD_REF_URL ?? '';

const COPY: Record<AffiliatePlacement, { line: string; cta: string }> = {
  'result-below-total': {
    line: 'Cost adding up? Self-host an OSS model on rented GPU.',
    cta: 'Compare on RunPod →',
  },
  'pricing-data-footer': {
    line: 'Need cheaper inference? Rent a GPU and run an OSS model instead of the per-token API.',
    cta: 'See RunPod pricing →',
  },
};

interface AffiliateSlotProps {
  placement: AffiliatePlacement;
  className?: string;
}

/**
 * Single-affiliate, contextual nudge. Currently RunPod-only (per the Muse-grade discipline
 * of not running 80 affiliate dashboards). When the env var is unset the component renders
 * nothing — keeps the dev/preview deploys clean before the URL is set in Vercel.
 */
export function AffiliateSlot({ placement, className }: AffiliateSlotProps) {
  if (!RUNPOD_REF_URL) return null;
  const { line, cta } = COPY[placement];

  return (
    <aside
      className={[
        'rounded-md border border-(--border) bg-(--surface)/60 px-4 py-3 text-sm',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      data-affiliate-placement={placement}
    >
      <p className="text-(--text-muted)">
        {line}{' '}
        <a
          href={RUNPOD_REF_URL}
          target="_blank"
          rel="noopener sponsored"
          onClick={() => events.affiliateClick('runpod', placement)}
          className="text-(--accent) underline-offset-4 hover:underline"
        >
          {cta}
        </a>
      </p>
    </aside>
  );
}
