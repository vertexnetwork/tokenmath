import type { ModelId } from "@/lib/pricing";

/**
 * Per-model calibration factor applied to the raw tokenizer count.
 *
 * - Claude 4.x: approximated with cl100k_base (no official client tokenizer).
 * - Gemini 2.5: approximated with o200k_base (no official client tokenizer).
 * - OpenAI: gpt-tokenizer ships the canonical OpenAI vocab — the count is exact, factor 1.0.
 *
 * Update Claude/Gemini factors with empirical reference samples (see tests/tokenizer.test.ts).
 * OpenAI factors should stay 1.0 — anything else means a tokenizer-vs-vocab mismatch.
 */
export const calibrationFactor: Readonly<Record<ModelId, number>> = Object.freeze({
  "claude-4-5-sonnet": 1.0,
  "claude-4-5-haiku": 1.0,
  // Opus 4.7 uses Anthropic's newer tokenizer — ~30% more tokens than cl100k on the same text.
  // Approximate that inflation with 1.3× (Sonnet 4.5 / Haiku 4.5 still use the old tokenizer, so
  // they stay 1.0). Drift is wider than the ±2% we quote for old-tokenizer Claude — surfaced in
  // the Opus page copy. Refine against empirical samples in tests/tokenizer.test.ts.
  "claude-4-7-opus": 1.3,
  // Opus 4.8 and Sonnet 5 use the same newer Anthropic tokenizer — same 1.3× calibration.
  "claude-4-8-opus": 1.3,
  "claude-5-sonnet": 1.3,
  "gemini-2-5-pro": 1.0,
  "gemini-2-5-flash": 1.0,
  // Gemini 3.1 Pro: approximated via o200k (no offline Gemini tokenizer), factor 1.0.
  "gemini-3-1-pro": 1.0,
  "gpt-5": 1.0,
  "gpt-5-mini": 1.0,
  "gpt-5-nano": 1.0,
  // GPT-5.5: canonical o200k_base — exact, factor 1.0.
  "gpt-5-5": 1.0,
  "gpt-4-1": 1.0,
  "gpt-4-1-mini": 1.0,
  // GPT-4o family uses the same canonical o200k_base vocab — exact, factor 1.0.
  "gpt-4o": 1.0,
  "gpt-4o-mini": 1.0,
});
