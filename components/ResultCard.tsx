'use client';

import Link from 'next/link';
import { useState } from 'react';
import { APPROX_DRIFT, costUsd, MODELS, type ModelPricing } from '@/lib/pricing';

interface ResultCardProps {
  model: ModelPricing;
  inputTokens: number;
  outputTokens: number;
  approx: boolean;
}

export function ResultCard({ model, inputTokens, outputTokens, approx }: ResultCardProps) {
  const { inputUsd, outputUsd, totalUsd } = costUsd(model, inputTokens, outputTokens);
  const overContext = inputTokens > model.contextWindow;
  const drift = APPROX_DRIFT[model.vendor];

  return (
    <div className="rounded-xl border border-(--border) bg-(--surface) p-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Tokens" value={formatNumber(inputTokens)}>
          {approx && (
            <span
              className="ml-2 inline-flex items-center rounded-full border border-(--border) px-2 py-0.5 text-[10px] uppercase tracking-wide text-(--text-muted)"
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
        <Stat label="Total" value={formatUsd(totalUsd)} accent dataMask="result-cost" />
      </div>

      <div className="mt-4 flex items-center justify-end">
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
  // Find models with a window that fits the current input. Sort by smallest fitting window
  // first (cheapest swap most often) and cap at three suggestions.
  const alternatives = MODELS.filter(
    (m) => m.id !== model.id && m.contextWindow >= inputTokens,
  )
    .sort((a, b) => a.contextWindow - b.contextWindow)
    .slice(0, 3);

  const overage = inputTokens - model.contextWindow;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="mt-4 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200"
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
      <span aria-hidden>{copied ? '✓' : '⧉'}</span>
      {copied ? 'Copied' : 'Copy summary'}
    </button>
  );
}

function Stat({
  label,
  value,
  hint,
  children,
  accent = false,
  dataMask,
}: {
  label: string;
  value: string;
  hint?: string;
  children?: React.ReactNode;
  accent?: boolean;
  dataMask?: string;
}) {
  return (
    <div>
      <div className="flex items-center text-xs uppercase tracking-wide text-(--text-muted)">
        {label}
        {children}
      </div>
      <div
        className={[
          'result-num mt-1 text-2xl font-semibold tabular-nums sm:text-3xl',
          accent ? 'text-(--accent)' : 'text-(--text)',
        ]
          .filter(Boolean)
          .join(' ')}
        // Cost totals can leak prompt structure via length/precision (§6.2) — tag for Clarity masking.
        data-clarity-mask={dataMask ? 'true' : undefined}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-(--text-muted)">{hint}</div>}
    </div>
  );
}

function formatNumber(n: number) {
  return new Intl.NumberFormat('en-US').format(n);
}

function formatUsd(n: number) {
  if (n === 0) return '$0.00';
  if (n < 0.01) return `<$0.01`;
  if (n < 1) return `$${n.toFixed(3)}`;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(n);
}
