"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { costUsd, DEFAULT_MODEL_ID, getModelById, type ModelId } from "@/lib/pricing";
import { countTokens } from "@/lib/tokenizers";
import { bucketFor, events } from "@/lib/analytics";
import { decodeShareState, hasShareState } from "@/lib/share";
import type { ExamplePreset } from "@/lib/examples";
import type { SavedScenario } from "@/lib/scenarios";
import { AffiliateSlot } from "./AffiliateSlot";
import { ModelPicker } from "./ModelPicker";
import { ResultCard } from "./ResultCard";
import { ExampleChips } from "./ExampleChips";
import { CompareTable } from "./CompareTable";
import { SavedScenarios } from "./SavedScenarios";
import { ShareButton } from "./ShareButton";
import { PrivacyReceipts } from "./PrivacyReceipts";
import { MobileTotalBar } from "./MobileTotalBar";
import { CompareIcon, LockIcon } from "./icons";

interface CalculatorProps {
  defaultModelId?: ModelId;
  /** Hide the model picker on pSEO pages where the model is fixed by the route. */
  lockModel?: boolean;
}

const MAX_INPUT_CHARS = 1_000_000;
const DEBOUNCE_MS = 200;
const DEFAULT_OUTPUT_TOKENS = 1024;
// Hard ceiling on the response-length input. No model accepts a response longer than its
// context window; 200k is a reasonable upper bound for any current frontier model.
const MAX_OUTPUT_TOKENS = 200_000;
const OUTPUT_PRESETS = [256, 1024, 4096];
// Above this input size the worker path kicks in (see lib/tokenizers/index.ts) — we surface
// a loading state to keep the user oriented while the worker spins up.
const LOADING_THRESHOLD = 50_000;

export function Calculator({
  defaultModelId = DEFAULT_MODEL_ID,
  lockModel = false,
}: CalculatorProps) {
  const promptId = useId();
  const promptMetaId = useId();
  const modelId = useId();
  const outputId = useId();
  const resultId = useId();

  const [text, setText] = useState("");
  const [model, setModel] = useState<ModelId>(defaultModelId);
  const [expectedOutputTokens, setExpectedOutputTokens] = useState<number>(DEFAULT_OUTPUT_TOKENS);
  const [compareOpen, setCompareOpen] = useState(false);

  const [tokens, setTokens] = useState(0);
  const [approx, setApprox] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestRef = useRef(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Apply ?m=&t=&o= share state on mount, then strip the params from the URL so that
  // future interactions don't keep stale "shared" params in the address bar.
  // setState is wrapped in setTimeout(0) to satisfy react-hooks/set-state-in-effect;
  // the brief flash of default state before the prefill is acceptable for this flow.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const shared = decodeShareState(params);
    if (!hasShareState(shared)) return;
    window.setTimeout(() => {
      if (shared.model && getModelById(shared.model) && !lockModel) setModel(shared.model);
      if (shared.outputTokens) {
        setExpectedOutputTokens(Math.min(MAX_OUTPUT_TOKENS, shared.outputTokens));
      }
      if (shared.text) setText(shared.text.slice(0, MAX_INPUT_CHARS));
      const cleanedUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, "", cleanedUrl);
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pending + error are kept in state but DERIVED for display so empty-text resets don't need
  // a synchronous setState in the effect body (keeps `react-hooks/set-state-in-effect` quiet).
  useEffect(() => {
    const trimmed = text.length > MAX_INPUT_CHARS ? text.slice(0, MAX_INPUT_CHARS) : text;
    if (trimmed.length === 0) return;

    const ticket = ++requestRef.current;
    const showLoading = trimmed.length > LOADING_THRESHOLD;
    const loadingTimer = showLoading
      ? window.setTimeout(() => {
          if (ticket === requestRef.current) setPending(true);
        }, 0)
      : null;

    const timer = window.setTimeout(async () => {
      try {
        const result = await countTokens(model, trimmed);
        if (ticket !== requestRef.current) return;
        setTokens(result.tokens);
        setApprox(result.approx);
        setError(null);
        events.calcRun(model, bucketFor(result.tokens));
      } catch {
        if (ticket !== requestRef.current) return;
        // Surface tokenizer failures (worker boot errors, dynamic-import 404s) instead of
        // leaving the user staring at a stale number. Privacy contract is unchanged.
        setError("Couldn’t tokenize this input. Refresh the page or try a smaller prompt.");
      } finally {
        if (ticket === requestRef.current) setPending(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      if (loadingTimer !== null) window.clearTimeout(loadingTimer);
    };
  }, [text, model]);

  const isEmpty = text.length === 0;
  const displayTokens = isEmpty ? 0 : tokens;
  const displayPending = pending && !isEmpty;
  const displayError = isEmpty ? null : error;
  const pricing = getModelById(model);

  const totalUsd = useMemo(
    () => costUsd(pricing, displayTokens, expectedOutputTokens).totalUsd,
    [pricing, displayTokens, expectedOutputTokens],
  );

  const onPickPreset = (preset: ExamplePreset) => {
    setText(preset.text);
    textareaRef.current?.focus();
  };

  const onLoadScenario = (s: SavedScenario) => {
    setText(s.text);
    setExpectedOutputTokens(s.outputTokens);
    if (!lockModel) setModel(s.modelId);
  };

  const gridClass = lockModel
    ? "grid grid-cols-1 gap-4 sm:grid-cols-[auto_auto] sm:items-end sm:justify-start"
    : "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-end";

  return (
    <section id="calculator" className="flex flex-col gap-8">
      <div className={gridClass}>
        {!lockModel && (
          <div id="models">
            <ModelPicker
              id={modelId}
              value={model}
              onChange={(next) => {
                events.modelChanged(model, next);
                setModel(next);
              }}
            />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <label
            htmlFor={outputId}
            title="How long you expect the model's reply to be. Used for the output-cost estimate."
            className="text-eyebrow text-(--text-muted)"
          >
            Expected response (output tokens)
          </label>
          <div className="flex items-center gap-2">
            <input
              id={outputId}
              type="number"
              min={0}
              max={MAX_OUTPUT_TOKENS}
              step={64}
              value={expectedOutputTokens}
              onChange={(e) => {
                const next = Number.parseInt(e.target.value, 10);
                const clamped = Number.isFinite(next)
                  ? Math.max(0, Math.min(next, MAX_OUTPUT_TOKENS))
                  : 0;
                setExpectedOutputTokens(clamped);
              }}
              className="w-28 rounded-md border border-(--border) bg-(--surface) px-3 py-2 text-sm tabular-nums text-(--text) focus:border-(--accent) focus:outline-none"
            />
            <div className="flex gap-1" role="group" aria-label="Response length presets">
              {OUTPUT_PRESETS.map((n) => {
                const active = expectedOutputTokens === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setExpectedOutputTokens(n)}
                    aria-pressed={active}
                    className={`rounded-md border px-2 py-1 text-xs tabular-nums transition-colors ${
                      active
                        ? "border-(--accent) bg-(--accent)/10 text-(--accent)"
                        : "border-(--border) text-(--text-muted) hover:border-(--accent) hover:text-(--text)"
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label htmlFor={promptId} className="text-eyebrow text-(--text-muted)">
            Prompt
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-(--text-muted)">
              <LockIcon className="text-(--accent-2)" />
              Client-side. Never uploaded.
            </span>
            <button
              type="button"
              onClick={() => setText("")}
              disabled={isEmpty}
              className="text-xs text-(--text-muted) underline-offset-4 hover:text-(--text) hover:underline disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:no-underline"
            >
              Clear
            </button>
          </div>
        </div>
        <textarea
          id={promptId}
          ref={textareaRef}
          rows={12}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste up to 1M characters of prompt, system message, or code."
          maxLength={MAX_INPUT_CHARS}
          spellCheck={false}
          aria-describedby={promptMetaId}
          // Per §6.2 — Clarity must mask all prompt input. The ResultCard masks cost totals.
          data-clarity-mask="true"
          className="input-prompt min-h-48 w-full resize-y rounded-xl border border-(--border) bg-(--surface) p-4 text-sm leading-6 text-(--text) placeholder:text-(--text-faint) focus:border-(--accent) focus:outline-none"
        />
        <div
          id={promptMetaId}
          className="flex items-center justify-between text-xs text-(--text-faint)"
        >
          <span>
            {text.length.toLocaleString("en-US")} / {MAX_INPUT_CHARS.toLocaleString("en-US")}{" "}
            characters
            {displayPending && (
              <span className="ml-2 inline-flex items-center gap-1.5 text-(--accent)">
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-(--accent)"
                />
                tokenizing…
              </span>
            )}
          </span>
          <span>Context window: {pricing.contextWindow.toLocaleString("en-US")} tokens</span>
        </div>
        {displayError && (
          <p
            role="alert"
            aria-live="polite"
            className="rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-200"
          >
            {displayError}
          </p>
        )}
        {isEmpty && <ExampleChips onPick={onPickPreset} />}
      </div>

      <div id={resultId}>
        <ResultCard
          model={pricing}
          inputTokens={displayTokens}
          outputTokens={expectedOutputTokens}
          approx={approx}
        />
      </div>

      {!lockModel && (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setCompareOpen((v) => !v)}
            aria-expanded={compareOpen}
            className="inline-flex w-fit items-center gap-2 rounded-md border border-(--border) bg-(--surface) px-3 py-2 text-sm text-(--text-muted) hover:border-(--accent) hover:text-(--text)"
          >
            <CompareIcon className="text-(--accent)" />
            {compareOpen ? "Hide comparison" : "Compare across all models"}
          </button>
          {compareOpen && (
            <CompareTable
              text={text}
              outputTokens={expectedOutputTokens}
              selectedModelId={model}
              onSelect={(next) => {
                events.modelChanged(model, next);
                setModel(next);
              }}
            />
          )}
        </div>
      )}

      <div className="flex flex-wrap items-start gap-3">
        <ShareButton model={model} text={text} outputTokens={expectedOutputTokens} />
        <div className="flex-1">
          <SavedScenarios
            currentText={text}
            currentModelId={model}
            currentOutputTokens={expectedOutputTokens}
            onLoad={onLoadScenario}
          />
        </div>
      </div>

      <PrivacyReceipts />

      <AffiliateSlot placement="result-below-total" />

      <MobileTotalBar
        total={formatUsd(totalUsd)}
        modelLabel={pricing.label}
        visible={!isEmpty}
        observeId={resultId}
      />
    </section>
  );
}

function formatUsd(n: number) {
  if (n === 0) return "$0.00";
  if (n < 0.01) return "<$0.01";
  if (n < 1) return `$${n.toFixed(3)}`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}
