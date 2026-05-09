import type { ModelId } from '@/lib/pricing';

/**
 * Per-model calibration factor applied to the raw tokenizer count.
 *
 * We approximate Claude 4.x with @anthropic-ai/tokenizer (older Claude vocab) and Gemini 2.5
 * with o200k_base — neither is a 1:1 match for the current vendor tokenizer, so we expose a
 * single multiplier to nudge the approximation toward the vendor's reference counts.
 *
 * Update with empirical reference samples (see tests/tokenizer.test.ts).
 */
export const calibrationFactor: Readonly<Record<ModelId, number>> = Object.freeze({
  'claude-4-5-sonnet': 1.0,
  'claude-4-5-haiku': 1.0,
  'claude-4-7-opus': 1.0,
  'gemini-2-5-pro': 1.0,
  'gemini-2-5-flash': 1.0,
});
