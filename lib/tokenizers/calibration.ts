import type { ModelId } from '@/lib/pricing';

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
  'claude-4-5-sonnet': 1.0,
  'claude-4-5-haiku': 1.0,
  'claude-4-7-opus': 1.0,
  'gemini-2-5-pro': 1.0,
  'gemini-2-5-flash': 1.0,
  'gpt-5': 1.0,
  'gpt-5-mini': 1.0,
  'gpt-5-nano': 1.0,
  'gpt-4-1': 1.0,
  'gpt-4-1-mini': 1.0,
});
