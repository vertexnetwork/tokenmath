"use client";

import { events, type AffiliatePlacement } from "@/lib/analytics";
import { siteConfig } from "@/lib/site-config";

const PLACEMENT_COPY: Record<AffiliatePlacement, string> = {
  "result-below-total": "Cost adding up? There may be a cheaper way.",
  "pricing-data-footer": "Need cheaper inference? See the alternative.",
};

interface AffiliateSlotProps {
  placement: AffiliatePlacement;
  className?: string;
}

/**
 * Single-affiliate, contextual nudge. Driven by siteConfig.features.affiliate (which reads
 * NEXT_PUBLIC_AFFILIATE_URL/_LABEL/_PROVIDER). Renders nothing when not configured.
 */
export function AffiliateSlot({ placement, className }: AffiliateSlotProps) {
  const { enabled, url, label, provider } = siteConfig.features.affiliate;
  if (!enabled || !url) return null;
  const line = PLACEMENT_COPY[placement];
  const cta = label || "Learn more →";

  return (
    <aside
      className={[
        "rounded-md border border-(--border) bg-(--surface)/60 px-4 py-3 text-sm",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-affiliate-placement={placement}
    >
      <p className="text-(--text-muted)">
        {line}{" "}
        <a
          href={url}
          target="_blank"
          rel="noopener sponsored"
          onClick={() => events.affiliateClick(provider || "affiliate", placement)}
          className="text-(--accent) underline-offset-4 hover:underline"
        >
          {cta}
        </a>
      </p>
    </aside>
  );
}
