/**
 * Public tokenizer API per §4.1.
 *
 * - Lazy-loads the underlying tokenizer libraries on first call.
 * - Applies the per-model calibration factor.
 * - Reports `approx: true` for all current Claude 4.x and Gemini 2.5 models, since neither
 *   vendor publishes a current client tokenizer.
 * - For inputs > 50_000 characters, runs tokenization in a Web Worker so the main thread
 *   stays responsive.
 */

import type { ModelId } from '@/lib/pricing';
import { calibrationFactor } from './calibration';
import { countClaudeTokens } from './claude';
import { countGeminiTokens } from './gemini';
import type { WorkerResponse, TokenizerSource } from './worker';

const WORKER_THRESHOLD = 50_000;

export type { TokenizerSource };

export interface TokenCount {
  tokens: number;
  ms: number;
  source: TokenizerSource;
  /** True for all approximation-based counts. Currently always true for our supported models. */
  approx: boolean;
}

export async function countTokens(model: ModelId, text: string): Promise<TokenCount> {
  if (text.length === 0) {
    return { tokens: 0, ms: 0, source: sourceFor(model), approx: true };
  }

  if (text.length > WORKER_THRESHOLD && typeof Worker !== 'undefined') {
    return countInWorker(model, text);
  }

  return countInThread(model, text);
}

async function countInThread(model: ModelId, text: string): Promise<TokenCount> {
  const started = performance.now();
  const raw = model.startsWith('claude-')
    ? await countClaudeTokens(text)
    : await countGeminiTokens(text);
  const tokens = applyCalibration(model, raw);
  return {
    tokens,
    ms: performance.now() - started,
    source: sourceFor(model),
    approx: true,
  };
}

function sourceFor(model: ModelId): TokenizerSource {
  return model.startsWith('claude-') ? 'gpt-tokenizer-cl100k' : 'gemini-approx';
}

function applyCalibration(model: ModelId, raw: number): number {
  return Math.max(0, Math.round(raw * calibrationFactor[model]));
}

// --- Worker plumbing -------------------------------------------------------

let workerSingleton: Worker | null = null;
let nextRequestId = 0;
const pending = new Map<number, (r: WorkerResponse) => void>();

function getWorker(): Worker {
  if (workerSingleton) return workerSingleton;
  // The new URL(..., import.meta.url) form is what Webpack and Turbopack recognize as a
  // worker entry — it triggers a separate bundle. Module workers are widely supported.
  workerSingleton = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  workerSingleton.addEventListener('message', (event: MessageEvent<WorkerResponse>) => {
    const resolve = pending.get(event.data.id);
    if (resolve) {
      pending.delete(event.data.id);
      resolve(event.data);
    }
  });
  return workerSingleton;
}

async function countInWorker(model: ModelId, text: string): Promise<TokenCount> {
  const worker = getWorker();
  const id = ++nextRequestId;
  const response = await new Promise<WorkerResponse>((resolve) => {
    pending.set(id, resolve);
    worker.postMessage({ id, model, text });
  });
  if (!response.ok) {
    // Fall back to main-thread tokenization if the worker errored — privacy contract is
    // unchanged, only responsiveness suffers.
    return countInThread(model, text);
  }
  const tokens = applyCalibration(model, response.tokens);
  return { tokens, ms: response.ms, source: response.source, approx: true };
}
