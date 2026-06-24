import { track as vercelTrack } from "@vercel/analytics";
import type { ModelId } from "@/lib/pricing";

export type TokenBucket = "<1k" | "1k-10k" | "10k-100k" | "100k+";

export function bucketFor(tokens: number): TokenBucket {
  if (tokens < 1_000) return "<1k";
  if (tokens < 10_000) return "1k-10k";
  if (tokens < 100_000) return "10k-100k";
  return "100k+";
}

const ENABLED = process.env.NEXT_PUBLIC_VERCEL_ANALYTICS !== "0";

function safeTrack(event: string, properties: Record<string, string | number | boolean>) {
  if (!ENABLED) return;
  if (typeof window === "undefined") return;
  try {
    vercelTrack(event, properties);
  } catch {
    // Vercel's track() can throw if the script hasn't loaded yet — fail silent.
  }
}

export type AffiliatePlacement = "result-below-total" | "pricing-data-footer";

/** §6.1 — never includes prompt content; only aggregate event names + bucketed counts. */
export const events = {
  calcRun(model: ModelId, tokenBucket: TokenBucket) {
    safeTrack("calc_run", { model, tokenBucket });
  },
  modelChanged(from: ModelId, to: ModelId) {
    safeTrack("model_changed", { from, to });
  },
  vertexFooterOpened() {
    safeTrack("vertex_footer_opened", {});
  },
  themeToggled(to: "light" | "dark") {
    safeTrack("theme_toggled", { to });
  },
  affiliateClick(provider: string, placement: AffiliatePlacement) {
    safeTrack("affiliate_click", { provider, placement });
  },
  shareScenario(model: ModelId, includesPrompt: boolean) {
    // Tracks share-button clicks; the prompt content itself is never sent to analytics.
    safeTrack("share_scenario", { model, includesPrompt });
  },
  switchSuggested(from: ModelId, to: ModelId) {
    // Cost-decoder "Compare them" click — the closest thing to a conversion signal on the
    // free funnel (a user acting on a cheaper-model recommendation).
    safeTrack("switch_suggested", { from, to });
  },
  subscribe(stage: "submit" | "success", source: string) {
    // Price-alert opt-in funnel. Never includes the email address itself.
    safeTrack("subscribe", { stage, source });
  },
};
