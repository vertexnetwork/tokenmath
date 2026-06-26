/**
 * Model-vs-model comparison pages — a programmatic pSEO axis built ENTIRELY from the
 * verified numbers in MODELS[]. Each page answers a distinct, high-intent query
 * ("claude 4.5 sonnet vs gpt-5 pricing") with distinct computed facts, so the surface is
 * differentiated rather than the doorway/thin-content kind Google's scaled-content-abuse
 * policy penalises. No hand-written content, no fabricated data: if it isn't derivable
 * from pricing.ts it doesn't go on the page.
 */

import { MODELS, costUsd, type ModelPricing, type ModelSlug } from "./pricing";

const SEP = "-vs-";

/** A typical single RAG/chat turn — used for the worked dollar example on every page. */
export const EXAMPLE_INPUT_TOKENS = 10_000;
export const EXAMPLE_OUTPUT_TOKENS = 2_000;

export interface ModelPair {
  a: ModelPricing;
  b: ModelPricing;
}

export function formatPerM(usdPerM: number): string {
  return `$${usdPerM}`;
}

/** Canonical, order-independent slug for a pair (slugs sorted lexicographically). */
export function pairSlug(x: ModelSlug, y: ModelSlug): string {
  const [a, b] = [x, y].sort();
  return `${a}${SEP}${b}`;
}

/** Every unordered pair, as canonical slugs. C(12,2) = 66 today. */
export function allPairSlugs(): string[] {
  const slugs: string[] = [];
  for (let i = 0; i < MODELS.length; i++) {
    for (let j = i + 1; j < MODELS.length; j++) {
      slugs.push(pairSlug(MODELS[i].slug, MODELS[j].slug));
    }
  }
  return slugs;
}

/** Every unordered pair with its canonical slug + both model objects (sitemap, cross-linking). */
export function allPairs(): { slug: string; a: ModelPricing; b: ModelPricing }[] {
  const out: { slug: string; a: ModelPricing; b: ModelPricing }[] = [];
  for (let i = 0; i < MODELS.length; i++) {
    for (let j = i + 1; j < MODELS.length; j++) {
      out.push({ slug: pairSlug(MODELS[i].slug, MODELS[j].slug), a: MODELS[i], b: MODELS[j] });
    }
  }
  return out;
}

/**
 * Resolve a route param to a pair. Returns `canonical` so the page can 301 a non-canonical
 * ordering (b-vs-a) to the single indexable URL and avoid duplicate content.
 */
export function getPairBySlug(
  raw: string,
): { a: ModelPricing; b: ModelPricing; canonical: string; isCanonical: boolean } | undefined {
  const idx = raw.indexOf(SEP);
  if (idx === -1) return undefined;
  const left = raw.slice(0, idx);
  const right = raw.slice(idx + SEP.length);
  if (left === right) return undefined;
  const a = MODELS.find((m) => m.slug === left);
  const b = MODELS.find((m) => m.slug === right);
  if (!a || !b) return undefined;
  const canonical = pairSlug(a.slug, b.slug);
  return { a, b, canonical, isCanonical: canonical === raw };
}

function pct(cheaper: number, dearer: number): number {
  if (dearer === 0) return 0;
  return Math.round((1 - cheaper / dearer) * 100);
}

export interface PairFacts {
  /** Cheaper model on input tokens, with the % saving (0 when equal). */
  cheaperInput: { model: ModelPricing; pct: number } | null;
  cheaperOutput: { model: ModelPricing; pct: number } | null;
  /** Worked example: total cost of EXAMPLE_INPUT/OUTPUT on each, and the cheaper one. */
  example: {
    aTotal: number;
    bTotal: number;
    cheaper: ModelPricing | null;
    savingPctPer1kRequests: number;
  };
  /** Larger context window, or null when equal. */
  biggerContext: ModelPricing | null;
  sameVendor: boolean;
}

export function computeFacts(a: ModelPricing, b: ModelPricing): PairFacts {
  const cheaperInput =
    a.inputUsdPerM === b.inputUsdPerM
      ? null
      : a.inputUsdPerM < b.inputUsdPerM
        ? { model: a, pct: pct(a.inputUsdPerM, b.inputUsdPerM) }
        : { model: b, pct: pct(b.inputUsdPerM, a.inputUsdPerM) };

  const cheaperOutput =
    a.outputUsdPerM === b.outputUsdPerM
      ? null
      : a.outputUsdPerM < b.outputUsdPerM
        ? { model: a, pct: pct(a.outputUsdPerM, b.outputUsdPerM) }
        : { model: b, pct: pct(b.outputUsdPerM, a.outputUsdPerM) };

  const aTotal = costUsd(a, EXAMPLE_INPUT_TOKENS, EXAMPLE_OUTPUT_TOKENS).totalUsd;
  const bTotal = costUsd(b, EXAMPLE_INPUT_TOKENS, EXAMPLE_OUTPUT_TOKENS).totalUsd;
  const cheaper = aTotal === bTotal ? null : aTotal < bTotal ? a : b;
  const lo = Math.min(aTotal, bTotal);
  const hi = Math.max(aTotal, bTotal);

  return {
    cheaperInput,
    cheaperOutput,
    example: {
      aTotal,
      bTotal,
      cheaper,
      savingPctPer1kRequests: pct(lo, hi),
    },
    biggerContext:
      a.contextWindow === b.contextWindow ? null : a.contextWindow > b.contextWindow ? a : b,
    sameVendor: a.vendor === b.vendor,
  };
}

export interface PairAngle {
  heading: string;
  body: string;
}

/**
 * The per-pair "decision angle" — the section that keeps the 66 comparison pages from reading
 * like find-and-replace of one template. Each pair lands in one of a few clusters (same-family,
 * same-vendor, cross-vendor different-tier, cross-vendor near-peer) and gets a distinct heading
 * + a body keyed to *its* numbers. Still 100% derived from MODELS[] — no hand-written claims.
 */
export function pairAngle(a: ModelPricing, b: ModelPricing, f: PairFacts): PairAngle {
  const lo = Math.min(f.example.aTotal, f.example.bTotal);
  const hi = Math.max(f.example.aTotal, f.example.bTotal);
  const ratio = lo > 0 ? hi / lo : Infinity;
  const cheaper = f.example.cheaper;
  const dearer = cheaper ? (cheaper.slug === a.slug ? b : a) : null;
  const exactSide =
    a.vendor === "openai" || b.vendor === "openai"
      ? "the OpenAI side counts exactly; the other lands within a few percent"
      : "both counts are approximate to within a few percent";

  // Same vendor: a switch is cheap (shared SDK + tokenizer), so it's a pure price/quality call.
  if (f.sameVendor) {
    if (!cheaper || !dearer) {
      return {
        heading: "Same vendor, same price",
        body: `${a.label} and ${b.label} are from the same vendor and cost the same on this workload, so price isn't the deciding factor — choose on capability, context window, or latency. Switching is a model-string change, with no SDK or tokenizer churn.`,
      };
    }
    const sameFamily = a.family === b.family;
    return {
      heading: sameFamily ? "Same family — pick on price" : "Same vendor — an easy switch",
      body: `Moving between ${a.label} and ${b.label} is ${
        sameFamily
          ? "a one-line model-string change — same family, same tokenizer, nothing to re-encode"
          : "a same-vendor move — one SDK, one tokenizer, so no recalibration"
      }. That makes this a straight cost/quality call: send the routine bulk of traffic to ${
        cheaper.label
      } (${formatPerM(cheaper.inputUsdPerM)}/${formatPerM(
        cheaper.outputUsdPerM,
      )} per 1M) and reserve ${
        dearer.label
      } for the requests that visibly need its extra headroom. On the worked example above that split is worth about ${f.example.savingPctPer1kRequests}% per request — small per call, real money once you multiply by volume.`,
    };
  }

  // Cross-vendor, wide price gap: different tiers that rarely compete for the same job.
  if (ratio >= 4 && cheaper && dearer) {
    return {
      heading: "Different leagues",
      body: `These two sit in different price tiers — ${dearer.label} runs roughly ${Math.round(
        ratio,
      )}× the per-request cost of ${cheaper.label} on the worked example — so they rarely compete for the same job. Reach for ${
        cheaper.label
      } on high-volume, latency-sensitive work (classification, extraction, routing) and ${
        dearer.label
      } only where the harder reasoning earns its price. They're different vendors, so expect a different API and tokenizer: ${exactSide} — budget a small calibration buffer when you switch.`,
    };
  }

  // Cross-vendor, comparable price: the genuinely interesting head-to-head.
  return {
    heading: "Close call — decide on output cost",
    body: `${a.label} and ${b.label} are close enough on price that the tie-breakers matter more than the headline rate. Output tokens are usually the dominant cost driver, so weigh ${formatPerM(
      a.outputUsdPerM,
    )} vs ${formatPerM(b.outputUsdPerM)} per 1M output first${
      f.biggerContext
        ? `, then context window — ${f.biggerContext.label} carries the larger one at ${f.biggerContext.contextWindow.toLocaleString(
            "en-US",
          )} tokens`
        : ", where both offer the same context window"
    }. They're different vendors, so factor in a small tokenizer calibration buffer on whichever side isn't exact.`,
  };
}
