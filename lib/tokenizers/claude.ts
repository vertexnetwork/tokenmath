/**
 * Claude tokenizer approximation.
 *
 * Anthropic does not publish a current Claude 4.x client tokenizer. We approximate with
 * gpt-tokenizer's cl100k_base encoding — empirically the closest match for Claude 4.x text
 * — and apply per-model calibration in lib/tokenizers/index.ts.
 *
 * Spec deviation: §2.1 lists @anthropic-ai/tokenizer as a fallback for "older Claude vocab"
 * (Claude 1/2/3). Our model list (lib/pricing.ts) is Claude 4.5+ only, so that fallback is
 * unused — and the package pulls a WASM dep which complicates the client bundle. Re-add
 * if and when older Claude models join the model list.
 */

let countPromise: Promise<(text: string) => number> | null = null;

async function load(): Promise<(text: string) => number> {
  if (countPromise) return countPromise;
  countPromise = (async () => {
    const mod = await import("gpt-tokenizer/encoding/cl100k_base");
    return (text: string) => mod.countTokens(text);
  })();
  return countPromise;
}

export async function countClaudeTokens(text: string): Promise<number> {
  const count = await load();
  return count(text);
}
