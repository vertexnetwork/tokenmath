/**
 * MODELS[] is the single source of truth for what tokenmath supports.
 *
 * Pricing values reflect published rates as of each entry's `dataAsOf`. Verify against
 * the vendor's official pricing page in /pricing-data when refreshing this list.
 *
 * Slugs are pre-computed to avoid drift with the [model] route in app/token-calculator/.
 */

export type ModelId =
  | "claude-4-5-sonnet"
  | "claude-4-5-haiku"
  | "claude-4-7-opus"
  | "gemini-2-5-pro"
  | "gemini-2-5-flash"
  | "gpt-5"
  | "gpt-5-mini"
  | "gpt-5-nano"
  | "gpt-4-1"
  | "gpt-4-1-mini"
  | "gpt-4o"
  | "gpt-4o-mini";

export type Vendor = "anthropic" | "google" | "openai";

export type ModelSlug =
  | "anthropic-claude-4-5-sonnet"
  | "anthropic-claude-4-5-haiku"
  | "anthropic-claude-4-7-opus"
  | "google-gemini-2-5-pro"
  | "google-gemini-2-5-flash"
  | "openai-gpt-5"
  | "openai-gpt-5-mini"
  | "openai-gpt-5-nano"
  | "openai-gpt-4-1"
  | "openai-gpt-4-1-mini"
  | "openai-gpt-4o"
  | "openai-gpt-4o-mini";

export interface PricingTier {
  /** Token threshold (inclusive). null means "no upper bound". */
  upTo: number | null;
  inputUsdPerM: number;
  outputUsdPerM: number;
}

export interface ModelPricing {
  id: ModelId;
  slug: ModelSlug;
  label: string;
  vendor: Vendor;
  /** Family for grouping in UI ("Claude 4.5", "Gemini 2.5"). */
  family: string;
  /** Default tier prices (used for the headline number). */
  inputUsdPerM: number;
  outputUsdPerM: number;
  /** Context window in tokens. */
  contextWindow: number;
  /** ISO date — when these prices last *changed* (used by users to spot drift). */
  dataAsOf: string;
  /**
   * ISO date — when prices were last *checked* against the vendor's site, even if no
   * change resulted. Bumped on every successful auto-refresh run. When omitted, falls
   * back to dataAsOf.
   */
  lastVerified?: string;
  /**
   * Optional tiered pricing (e.g. Gemini 2.5 Pro charges more above a context threshold).
   * If present, callers should select the right tier based on token count.
   */
  tiers?: PricingTier[];
  /** URL the dataAsOf was sourced from — surfaced on /pricing-data. */
  source: string;
}

export const MODELS: readonly ModelPricing[] = [
  {
    id: "claude-4-5-sonnet",
    slug: "anthropic-claude-4-5-sonnet",
    label: "Claude 4.5 Sonnet",
    vendor: "anthropic",
    family: "Claude 4.5",
    inputUsdPerM: 3,
    outputUsdPerM: 15,
    contextWindow: 200_000,
    dataAsOf: "2026-05-09",
    source: "https://www.anthropic.com/pricing",
  },
  {
    id: "claude-4-5-haiku",
    slug: "anthropic-claude-4-5-haiku",
    label: "Claude 4.5 Haiku",
    vendor: "anthropic",
    family: "Claude 4.5",
    inputUsdPerM: 1,
    outputUsdPerM: 5,
    contextWindow: 200_000,
    dataAsOf: "2026-05-09",
    source: "https://www.anthropic.com/pricing",
  },
  {
    id: "claude-4-7-opus",
    slug: "anthropic-claude-4-7-opus",
    label: "Claude 4.7 Opus",
    vendor: "anthropic",
    family: "Claude 4.7",
    inputUsdPerM: 15,
    outputUsdPerM: 75,
    contextWindow: 200_000,
    dataAsOf: "2026-05-09",
    source: "https://www.anthropic.com/pricing",
  },
  {
    id: "gemini-2-5-pro",
    slug: "google-gemini-2-5-pro",
    label: "Gemini 2.5 Pro",
    vendor: "google",
    family: "Gemini 2.5",
    // Default tier (≤200k context). Above that, both input + output prices double — see `tiers`.
    inputUsdPerM: 1.25,
    outputUsdPerM: 10,
    contextWindow: 1_000_000,
    dataAsOf: "2026-05-09",
    source: "https://ai.google.dev/pricing",
    tiers: [
      { upTo: 200_000, inputUsdPerM: 1.25, outputUsdPerM: 10 },
      { upTo: null, inputUsdPerM: 2.5, outputUsdPerM: 15 },
    ],
  },
  {
    id: "gemini-2-5-flash",
    slug: "google-gemini-2-5-flash",
    label: "Gemini 2.5 Flash",
    vendor: "google",
    family: "Gemini 2.5",
    inputUsdPerM: 0.3,
    outputUsdPerM: 2.5,
    contextWindow: 1_000_000,
    dataAsOf: "2026-05-09",
    source: "https://ai.google.dev/pricing",
  },
  {
    id: "gpt-5",
    slug: "openai-gpt-5",
    label: "GPT-5",
    vendor: "openai",
    family: "GPT-5",
    inputUsdPerM: 1.25,
    outputUsdPerM: 10,
    contextWindow: 400_000,
    dataAsOf: "2026-05-09",
    source: "https://openai.com/api/pricing/",
  },
  {
    id: "gpt-5-mini",
    slug: "openai-gpt-5-mini",
    label: "GPT-5 Mini",
    vendor: "openai",
    family: "GPT-5",
    inputUsdPerM: 0.25,
    outputUsdPerM: 2,
    contextWindow: 400_000,
    dataAsOf: "2026-05-09",
    source: "https://openai.com/api/pricing/",
  },
  {
    id: "gpt-5-nano",
    slug: "openai-gpt-5-nano",
    label: "GPT-5 Nano",
    vendor: "openai",
    family: "GPT-5",
    inputUsdPerM: 0.05,
    outputUsdPerM: 0.4,
    contextWindow: 400_000,
    dataAsOf: "2026-05-09",
    source: "https://openai.com/api/pricing/",
  },
  {
    id: "gpt-4-1",
    slug: "openai-gpt-4-1",
    label: "GPT-4.1",
    vendor: "openai",
    family: "GPT-4.1",
    inputUsdPerM: 2,
    outputUsdPerM: 8,
    contextWindow: 1_047_576,
    dataAsOf: "2026-05-09",
    source: "https://openai.com/api/pricing/",
  },
  {
    id: "gpt-4-1-mini",
    slug: "openai-gpt-4-1-mini",
    label: "GPT-4.1 Mini",
    vendor: "openai",
    family: "GPT-4.1",
    inputUsdPerM: 0.4,
    outputUsdPerM: 1.6,
    contextWindow: 1_047_576,
    dataAsOf: "2026-05-09",
    source: "https://openai.com/api/pricing/",
  },
  {
    // Legacy model: superseded by the GPT-4.1 / GPT-5 generations and no longer listed on
    // OpenAI's primary pricing page, but still callable at grandfathered rates and heavily
    // pinned in production code. Pricing verified 2026-05-18 against OpenAI's published
    // GPT-4o rates; revisit if OpenAI retires the endpoint.
    id: "gpt-4o",
    slug: "openai-gpt-4o",
    label: "GPT-4o",
    vendor: "openai",
    family: "GPT-4o",
    inputUsdPerM: 2.5,
    outputUsdPerM: 10,
    contextWindow: 128_000,
    dataAsOf: "2026-05-18",
    source: "https://openai.com/api/pricing/",
  },
  {
    // Legacy model — see GPT-4o note above. Same o200k_base tokenizer, exact (factor 1.0).
    id: "gpt-4o-mini",
    slug: "openai-gpt-4o-mini",
    label: "GPT-4o mini",
    vendor: "openai",
    family: "GPT-4o",
    inputUsdPerM: 0.15,
    outputUsdPerM: 0.6,
    contextWindow: 128_000,
    dataAsOf: "2026-05-18",
    source: "https://openai.com/api/pricing/",
  },
] as const;

const MODELS_BY_ID: Readonly<Record<ModelId, ModelPricing>> = Object.freeze(
  Object.fromEntries(MODELS.map((m) => [m.id, m])) as Record<ModelId, ModelPricing>,
);

const MODELS_BY_SLUG: Readonly<Record<ModelSlug, ModelPricing>> = Object.freeze(
  Object.fromEntries(MODELS.map((m) => [m.slug, m])) as Record<ModelSlug, ModelPricing>,
);

export function getModelById(id: ModelId): ModelPricing {
  return MODELS_BY_ID[id];
}

export function getModelBySlug(slug: string): ModelPricing | undefined {
  return MODELS_BY_SLUG[slug as ModelSlug];
}

export function listModelSlugs(): ModelSlug[] {
  return MODELS.map((m) => m.slug);
}

/** Default model for the home page calculator. */
export const DEFAULT_MODEL_ID: ModelId = "claude-4-5-sonnet";

/**
 * Resolve the input/output prices to use for a given total input-token count, picking the
 * correct tier when the model has tiered pricing (e.g. Gemini 2.5 Pro above 200k).
 */
export function pricesFor(
  model: ModelPricing,
  inputTokens: number,
): { inputUsdPerM: number; outputUsdPerM: number } {
  if (!model.tiers || model.tiers.length === 0) {
    return { inputUsdPerM: model.inputUsdPerM, outputUsdPerM: model.outputUsdPerM };
  }
  for (const tier of model.tiers) {
    if (tier.upTo === null || inputTokens <= tier.upTo) {
      return { inputUsdPerM: tier.inputUsdPerM, outputUsdPerM: tier.outputUsdPerM };
    }
  }
  // Fallback — should be unreachable when the last tier has upTo: null.
  const last = model.tiers[model.tiers.length - 1];
  return { inputUsdPerM: last.inputUsdPerM, outputUsdPerM: last.outputUsdPerM };
}

/**
 * Cost of an input/output pair in USD, given token counts and the chosen model.
 * Output is approximate when callers don't know the response length — the UI should
 * surface that uncertainty.
 */
export function costUsd(
  model: ModelPricing,
  inputTokens: number,
  outputTokens: number,
): { inputUsd: number; outputUsd: number; totalUsd: number } {
  const { inputUsdPerM, outputUsdPerM } = pricesFor(model, inputTokens);
  const inputUsd = (inputTokens / 1_000_000) * inputUsdPerM;
  const outputUsd = (outputTokens / 1_000_000) * outputUsdPerM;
  return { inputUsd, outputUsd, totalUsd: inputUsd + outputUsd };
}

/**
 * The date a model's price was last *checked* against the vendor — `lastVerified` when set,
 * otherwise the `dataAsOf` it last changed. This is the honest per-page freshness signal
 * (sitemap lastmod, byline "verified" date), not the build date.
 */
export function modelVerifiedDate(model: ModelPricing): string {
  return model.lastVerified ?? model.dataAsOf;
}

/** The newest dataAsOf across all models — used by the footer disclaimer. */
export function latestDataAsOf(): string {
  return (
    MODELS.map((m) => m.dataAsOf)
      .sort()
      .at(-1) ?? ""
  );
}

/**
 * Approximation drift, per-vendor. Single source of truth for the "how accurate is this?"
 * copy that surfaces in ResultCard, Models page, About page, and pSEO MDX. If the
 * tokenizer or calibration changes, update here and every page reflects it.
 */
export const APPROX_DRIFT: Record<Vendor, { label: string; pill: string; blurb: string }> = {
  anthropic: {
    label: "±2%",
    pill: "±2% approx",
    blurb: "Approximated with cl100k_base — drift typically <2% on English and code.",
  },
  google: {
    label: "±3%",
    pill: "±3% approx",
    blurb: "Approximated with o200k_base; drift typically ~3% on English and code.",
  },
  openai: {
    label: "exact",
    pill: "exact",
    blurb: "Exact tokenization via the canonical OpenAI vocab (o200k_base).",
  },
};

/** Headline drift range across all approximated vendors. */
export const APPROX_RANGE = "±2–3%";

/**
 * ISO date the privacy policy was last reviewed. Bump this when the policy text changes,
 * not when the file is edited for unrelated reasons. Surfaced on /privacy.
 */
export const PRIVACY_UPDATED = "2026-05-09";
