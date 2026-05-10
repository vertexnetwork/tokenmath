/**
 * Gemini tokenizer approximation.
 *
 * Google does not publish a client-side tokenizer. We approximate with js-tiktoken's
 * o200k_base encoding (closest-known sentencepiece-ish family) and apply per-model
 * calibration in lib/tokenizers/index.ts.
 */

import type { Tiktoken } from "js-tiktoken/lite";

let encPromise: Promise<Tiktoken> | null = null;

async function loadEncoder(): Promise<Tiktoken> {
  if (encPromise) return encPromise;
  encPromise = (async () => {
    const [{ Tiktoken }, { default: o200k }] = await Promise.all([
      import("js-tiktoken/lite"),
      import("js-tiktoken/ranks/o200k_base"),
    ]);
    return new Tiktoken(o200k);
  })();
  return encPromise;
}

export async function countGeminiTokens(text: string): Promise<number> {
  const enc = await loadEncoder();
  return enc.encode(text).length;
}
