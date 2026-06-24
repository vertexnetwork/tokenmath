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
