'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { DEFAULT_MODEL_ID, getModelById, type ModelId } from '@/lib/pricing';
import { countTokens } from '@/lib/tokenizers';
import { ModelPicker } from './ModelPicker';
import { ResultCard } from './ResultCard';

interface CalculatorProps {
  defaultModelId?: ModelId;
  /** Hide the model picker on pSEO pages where the model is fixed by the route. */
  lockModel?: boolean;
}

const MAX_INPUT_CHARS = 1_000_000;
const DEBOUNCE_MS = 200;
const DEFAULT_OUTPUT_TOKENS = 1024;

export function Calculator({
  defaultModelId = DEFAULT_MODEL_ID,
  lockModel = false,
}: CalculatorProps) {
  const promptId = useId();
  const modelId = useId();
  const outputId = useId();

  const [text, setText] = useState('');
  const [model, setModel] = useState<ModelId>(defaultModelId);
  const [expectedOutputTokens, setExpectedOutputTokens] = useState<number>(DEFAULT_OUTPUT_TOKENS);

  const [tokens, setTokens] = useState(0);
  const [approx, setApprox] = useState(true);

  const requestRef = useRef(0);

  // Tokenization is debounced; cl100k/o200k are sub-ms for short text and run in a Web Worker
  // for inputs >50k chars (see lib/tokenizers/index.ts) — fast enough that we don't bother
  // with a loading state. Empty text is derived in render rather than reset via setState here
  // so `react-hooks/set-state-in-effect` stays quiet.
  useEffect(() => {
    const trimmed = text.length > MAX_INPUT_CHARS ? text.slice(0, MAX_INPUT_CHARS) : text;
    if (trimmed.length === 0) return;

    const ticket = ++requestRef.current;
    const timer = window.setTimeout(async () => {
      const result = await countTokens(model, trimmed);
      // Drop stale results if the user kept typing.
      if (ticket !== requestRef.current) return;
      setTokens(result.tokens);
      setApprox(result.approx);
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [text, model]);

  const isEmpty = text.length === 0;
  const displayTokens = isEmpty ? 0 : tokens;
  const pricing = getModelById(model);

  return (
    <section id="calculator" className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
        {!lockModel && (
          <div id="models">
            <ModelPicker id={modelId} value={model} onChange={setModel} />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <label htmlFor={outputId} className="text-xs uppercase tracking-wide text-(--text-muted)">
            Expected response (tokens)
          </label>
          <input
            id={outputId}
            type="number"
            min={0}
            step={64}
            value={expectedOutputTokens}
            onChange={(e) => {
              const next = Number.parseInt(e.target.value, 10);
              setExpectedOutputTokens(Number.isFinite(next) && next >= 0 ? next : 0);
            }}
            className="w-40 rounded-md border border-(--border) bg-(--surface) px-3 py-2 text-sm tabular-nums text-(--text) focus:border-(--accent) focus:outline-none"
          />
        </div>
        <span
          className="inline-flex h-9 items-center gap-2 rounded-full border border-(--accent-2)/40 bg-(--accent-2)/10 px-3 text-xs text-(--accent-2)"
          aria-label="Privacy"
        >
          <span aria-hidden>●</span>
          Client-side. Never uploaded.
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={promptId} className="text-xs uppercase tracking-wide text-(--text-muted)">
          Prompt
        </label>
        <textarea
          id={promptId}
          rows={12}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste up to 1M characters of prompt, system message, or code."
          maxLength={MAX_INPUT_CHARS}
          spellCheck={false}
          // Per §6.2 — Clarity must mask all prompt input. The ResultCard masks cost totals.
          data-clarity-mask="true"
          className="input-prompt min-h-48 w-full resize-y rounded-xl border border-(--border) bg-(--surface) p-4 text-sm leading-6 text-(--text) placeholder:text-(--text-muted)/60 focus:border-(--accent) focus:outline-none"
        />
        <div className="flex items-center justify-between text-xs text-(--text-muted)">
          <span>
            {text.length.toLocaleString('en-US')} / {MAX_INPUT_CHARS.toLocaleString('en-US')}{' '}
            characters
          </span>
          <span>Context window: {pricing.contextWindow.toLocaleString('en-US')} tokens</span>
        </div>
      </div>

      <ResultCard
        model={pricing}
        inputTokens={displayTokens}
        outputTokens={expectedOutputTokens}
        approx={approx}
      />
    </section>
  );
}
