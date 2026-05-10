/// <reference lib="webworker" />

/**
 * Web Worker that runs tokenization off the main thread for large inputs (>50k chars).
 * Spawned by lib/tokenizers/index.ts via:
 *   new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
 */

import type { ModelId } from '@/lib/pricing';
import { countClaudeTokens } from './claude';
import { countGeminiTokens } from './gemini';
import { countOpenAITokens } from './openai';

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
    let tokens: number;
    let source: TokenizerSource;
    if (model.startsWith('claude-')) {
      tokens = await countClaudeTokens(text);
      source = 'gpt-tokenizer-cl100k';
    } else if (model.startsWith('gemini-')) {
      tokens = await countGeminiTokens(text);
      source = 'gemini-approx';
    } else {
      tokens = await countOpenAITokens(text);
      source = 'gpt-tokenizer-o200k';
    }
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
