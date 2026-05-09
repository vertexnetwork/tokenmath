/// <reference lib="webworker" />

/**
 * Web Worker that runs tokenization off the main thread for large inputs (>50k chars).
 * Spawned by lib/tokenizers/index.ts via:
 *   new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
 */

import type { ModelId } from '@/lib/pricing';
import { countClaudeTokens } from './claude';
import { countGeminiTokens } from './gemini';

export type TokenizerSource = 'gpt-tokenizer-cl100k' | 'gpt-tokenizer-o200k' | 'gemini-approx';

interface WorkerRequest {
  id: number;
  model: ModelId;
  text: string;
}

interface WorkerSuccess {
  id: number;
  ok: true;
  tokens: number;
  ms: number;
  source: TokenizerSource;
}

interface WorkerFailure {
  id: number;
  ok: false;
  error: string;
}

export type WorkerResponse = WorkerSuccess | WorkerFailure;

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.addEventListener('message', async (event: MessageEvent<WorkerRequest>) => {
  const { id, model, text } = event.data;
  const started = performance.now();
  try {
    const isClaude = model.startsWith('claude-');
    const tokens = isClaude ? await countClaudeTokens(text) : await countGeminiTokens(text);
    const source: TokenizerSource = isClaude ? 'gpt-tokenizer-cl100k' : 'gemini-approx';
    const response: WorkerSuccess = {
      id,
      ok: true,
      tokens,
      ms: performance.now() - started,
      source,
    };
    ctx.postMessage(response);
  } catch (err) {
    const response: WorkerFailure = {
      id,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
    ctx.postMessage(response);
  }
});
