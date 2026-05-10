/**
 * OpenAI tokenizer.
 *
 * Unlike Claude and Gemini, OpenAI publishes the canonical tokenizer (tiktoken). The MIT
 * package `gpt-tokenizer` ships the same vocab, so for OpenAI models the count is exact
 * — no calibration needed and `approx: false` in the surfaced TokenCount.
 *
 * GPT-5, GPT-4.1, and o-series all use o200k_base encoding.
 */

let countPromise: Promise<(text: string) => number> | null = null;

async function load(): Promise<(text: string) => number> {
  if (countPromise) return countPromise;
  countPromise = (async () => {
    const mod = await import("gpt-tokenizer/encoding/o200k_base");
    return (text: string) => mod.countTokens(text);
  })();
  return countPromise;
}

export async function countOpenAITokens(text: string): Promise<number> {
  const count = await load();
  return count(text);
}
