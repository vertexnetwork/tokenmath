'use client';

import { costUsd, type ModelPricing } from '@/lib/pricing';

interface ResultCardProps {
  model: ModelPricing;
  inputTokens: number;
  outputTokens: number;
  approx: boolean;
}

export function ResultCard({ model, inputTokens, outputTokens, approx }: ResultCardProps) {
  const { inputUsd, outputUsd, totalUsd } = costUsd(model, inputTokens, outputTokens);
  const overContext = inputTokens > model.contextWindow;

  return (
    <div className="rounded-xl border border-(--border) bg-(--surface) p-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Tokens" value={formatNumber(inputTokens)}>
          {approx && (
            <span
              className="ml-2 inline-flex items-center rounded-full border border-(--border) px-2 py-0.5 text-[10px] uppercase tracking-wide text-(--text-muted)"
              title="Approximate — vendor tokenizers are not published for current-gen Claude/Gemini"
            >
              ±2% approx
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

      {overContext && (
        <p className="mt-4 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
          Input exceeds {formatNumber(model.contextWindow)}-token context window for {model.label}.
          The API will refuse the request.
        </p>
      )}
    </div>
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
