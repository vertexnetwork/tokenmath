'use client';

import Link from 'next/link';
import { useState } from 'react';
import { APPROX_DRIFT, costUsd, MODELS, type ModelPricing } from '@/lib/pricing';
import { CheckIcon, CopyIcon } from './icons';
import { CostSplitBar } from './CostSplitBar';
import { ContextMeter } from './ContextMeter';

interface ResultCardProps {
  model: ModelPricing;
  inputTokens: number;
  outputTokens: number;
  approx: boolean;
}

/**
 * Editorial Quiet result card. The total is the hero — single mono numeral in parchment
 * gold, tabular-nums, set in the largest type on the page when present. Inputs / outputs /
 * tokens are subordinate; they live in a small grid below so the eye lands on the answer
 * first and only digs in if the user wants the breakdown.
 */
export function ResultCard({ model, inputTokens, outputTokens, approx }: ResultCardProps) {
  const { inputUsd, outputUsd, totalUsd } = costUsd(model, inputTokens, outputTokens);
  const overContext = inputTokens > model.contextWindow;
  const drift = APPROX_DRIFT[model.vendor];
  const hasInput = inputTokens > 0;

  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface-2) p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-8">
      <div className="flex flex-col gap-1">
        <span className="text-eyebrow text-(--text-faint)">Total estimated cost</span>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span
            className={`result-hero text-display-xl ${hasInput ? '' : 'opacity-30'}`}
            data-clarity-mask="true"
          >
            {formatUsd(totalUsd)}
          </span>
          <span className="text-sm text-(--text-muted)">{model.label}</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
        <Stat label="Tokens" value={formatNumber(inputTokens)}>
          {approx && (
            <span
              className="ml-2 inline-flex items-center rounded-full border border-(--border) px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-(--text-faint)"
              title={`Approximate — ${drift.blurb}`}
            >
              {drift.pill}
            </span>
          )}
        </Stat>
        <Stat label="Input cost" value={formatUsd(inputUsd)} />
        <Stat
          label="Output cost (est.)"
          value={formatUsd(outputUsd)}
          hint={`@ ${formatNumber(outputTokens)} response tokens`}
        />
        <Stat
          label="Context used"
          value={`${Math.min(999, Math.round((inputTokens / model.contextWindow) * 100))}%`}
          hint={`of ${formatNumber(model.contextWindow)}`}
        />
      </div>

      {hasInput && (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-[1.5fr_1fr] sm:items-end">
          <CostSplitBar inputUsd={inputUsd} outputUsd={outputUsd} />
          <ContextMeter inputTokens={inputTokens} contextWindow={model.contextWindow} />
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-(--text-faint)">
          Verified {model.dataAsOf} · {drift.label}
        </span>
        <CopyButton
          model={model}
          inputTokens={inputTokens}
          outputTokens={outputTokens}
          inputUsd={inputUsd}
          outputUsd={outputUsd}
          totalUsd={totalUsd}
        />
      </div>

      {overContext && <OverContextWarning model={model} inputTokens={inputTokens} />}
    </div>
  );
}

function OverContextWarning({
  model,
  inputTokens,
}: {
  model: ModelPricing;
  inputTokens: number;
}) {
  const alternatives = MODELS.filter((m) => m.id !== model.id && m.contextWindow >= inputTokens)
    .sort((a, b) => a.contextWindow - b.contextWindow)
    .slice(0, 3);

  const overage = inputTokens - model.contextWindow;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="mt-6 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200"
    >
      <p>
        <strong>Over context window.</strong> Input is {formatNumber(inputTokens)} tokens — exceeds{' '}
        {model.label}&apos;s {formatNumber(model.contextWindow)}-token limit by{' '}
        {formatNumber(overage)}. The API will refuse the request.
      </p>
      {alternatives.length > 0 && (
        <p className="mt-2 text-amber-100/90">
          Fits in:{' '}
          {alternatives.map((m, i) => (
            <span key={m.id}>
              <Link
                href={`/token-calculator/${m.slug}`}
                className="underline-offset-4 hover:underline"
              >
                {m.label} ({formatNumber(m.contextWindow)})
              </Link>
              {i < alternatives.length - 1 ? ', ' : '.'}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}

function CopyButton({
  model,
  inputTokens,
  outputTokens,
  inputUsd,
  outputUsd,
  totalUsd,
}: {
  model: ModelPricing;
  inputTokens: number;
  outputTokens: number;
  inputUsd: number;
  outputUsd: number;
  totalUsd: number;
}) {
  const [copied, setCopied] = useState(false);
  const disabled = inputTokens === 0;

  const onClick = async () => {
    if (disabled) return;
    const summary = [
      `${model.label}`,
      `Input:  ${formatNumber(inputTokens)} tokens (${formatUsd(inputUsd)})`,
      `Output: ${formatNumber(outputTokens)} tokens (${formatUsd(outputUsd)}, est.)`,
      `Total:  ${formatUsd(totalUsd)}`,
      `— tokenmath.dev`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can fail in iframes / insecure contexts — silently no-op.
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Copy result summary"
      className="inline-flex items-center gap-2 rounded-md border border-(--border) bg-(--bg) px-3 py-1.5 text-xs text-(--text-muted) hover:border-(--accent) hover:text-(--text) disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-(--border) disabled:hover:text-(--text-muted)"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      {copied ? 'Copied' : 'Copy summary'}
    </button>
  );
}

function Stat({
  label,
  value,
  hint,
  children,
}: {
  label: string;
  value: string;
  hint?: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center text-eyebrow text-(--text-muted)">
        {label}
        {children}
      </div>
      <div
        className="result-num mt-1 text-lg font-semibold text-(--text) sm:text-xl"
        data-clarity-mask="true"
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-(--text-faint)">{hint}</div>}
    </div>
  );
}

function formatNumber(n: number) {
  return new Intl.NumberFormat('en-US').format(n);
}

function formatUsd(n: number) {
  if (n === 0) return '$0.00';
  if (n < 0.01) return '<$0.01';
  if (n < 1) return `$${n.toFixed(3)}`;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(n);
}
