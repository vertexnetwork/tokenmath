/**
 * Public tokenizer API per §4.1.
 *
 * - Lazy-loads the underlying tokenizer libraries on first call.
 * - Applies the per-model calibration factor.
 * - Reports `approx: false` for OpenAI (canonical tokenizer ships in gpt-tokenizer) and
 *   `approx: true` for Claude + Gemini (no official client tokenizer published).
 * - For inputs > 50_000 characters, runs tokenization in a Web Worker so the main thread
 *   stays responsive.
 */

import { MODELS, type ModelId } from '@/lib/pricing';
import { calibrationFactor } from './calibration';
import { countClaudeTokens } from './claude';
import { countGeminiTokens } from './gemini';
import { countOpenAITokens } from './openai';
import type { WorkerResponse, TokenizerSource } from './worker';

const WORKER_THRESHOLD = 50_000;

export type { TokenizerSource };

export interface TokenCount {
  tokens: number;
  ms: number;
  source: TokenizerSource;
  /** True for approximation-based counts (Claude / Gemini); false for OpenAI (exact). */
  approx: boolean;
}

type Family = 'claude' | 'gemini' | 'openai';

function familyOf(model: ModelId): Family {
  if (model.startsWith('claude-')) return 'claude';
  if (model.startsWith('gemini-')) return 'gemini';
  return 'openai';
}

function isApprox(model: ModelId): boolean {
  return familyOf(model) !== 'openai';
}

function sourceFor(model: ModelId): TokenizerSource {
  switch (familyOf(model)) {
    case 'claude':
      return 'gpt-tokenizer-cl100k';
    case 'openai':
      return 'gpt-tokenizer-o200k';
    case 'gemini':
      return 'gemini-approx';
  }
}

export async function countTokens(model: ModelId, text: string): Promise<TokenCount> {
  if (text.length === 0) {
    return { tokens: 0, ms: 0, source: sourceFor(model), approx: isApprox(model) };
  }

  if (text.length > WORKER_THRESHOLD && typeof Worker !== 'undefined') {
    return countInWorker(model, text);
  }

  return countInThread(model, text);
}

async function countInThread(model: ModelId, text: string): Promise<TokenCount> {
  const started = performance.now();
  const family = familyOf(model);
  let raw: number;
  if (family === 'claude') {
    raw = await countClaudeTokens(text);
  } else if (family === 'openai') {
    raw = await countOpenAITokens(text);
  } else {
    raw = await countGeminiTokens(text);
  }
  const tokens = applyCalibration(model, raw);
  return {
    tokens,
    ms: performance.now() - started,
    source: sourceFor(model),
    approx: isApprox(model),
  };
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
  return { tokens, ms: response.ms, source: response.source, approx: isApprox(model) };
}

/**
 * Tokenize once per *vocab* (cl100k for Claude, o200k via gpt-tokenizer for OpenAI,
 * o200k via js-tiktoken for Gemini), then apply per-model calibration for all 10 models.
 * Lets the Compare-mode table render without re-tokenizing the prompt 10 times.
 */
export async function countAllModels(text: string): Promise<Map<ModelId, number>> {
  const result = new Map<ModelId, number>();
  if (text.length === 0) {
    for (const m of MODELS) result.set(m.id, 0);
    return result;
  }
  const [claudeRaw, openaiRaw, geminiRaw] = await Promise.all([
    countClaudeTokens(text),
    countOpenAITokens(text),
    countGeminiTokens(text),
  ]);
  for (const m of MODELS) {
    const family = familyOf(m.id);
    const raw = family === 'claude' ? claudeRaw : family === 'openai' ? openaiRaw : geminiRaw;
    result.set(m.id, applyCalibration(m.id, raw));
  }
  return result;
}
