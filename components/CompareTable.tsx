"use client";

import { useEffect, useState } from "react";
import { costUsd, MODELS, type ModelId, type ModelPricing } from "@/lib/pricing";
import { countAllModels } from "@/lib/tokenizers";

/**
 * Compare-mode table: the same prompt scored against every supported model, sorted by
 * total cost ascending. The single biggest unique value of the calculator — "should I be
 * using Haiku or GPT-5 Mini for this?" — answered in one glance.
 */
interface CompareTableProps {
  text: string;
  outputTokens: number;
  selectedModelId: ModelId;
  onSelect: (modelId: ModelId) => void;
}

interface Row {
  model: ModelPricing;
  inputTokens: number;
  inputUsd: number;
  outputUsd: number;
  totalUsd: number;
}

export function CompareTable({ text, outputTokens, selectedModelId, onSelect }: CompareTableProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [pending, setPending] = useState(false);

  // Tokenize once per (text, outputTokens). When text is empty we don't fetch — we just
  // render the placeholder; the stale `rows` are gated by the early-return below so they
  // never paint.
  useEffect(() => {
    if (text.length === 0) return;
    let cancelled = false;
    // setPending happens out of the synchronous effect body to satisfy
    // react-hooks/set-state-in-effect.
    const pendingHandle = window.setTimeout(() => {
      if (!cancelled) setPending(true);
    }, 0);
    countAllModels(text).then((counts) => {
      window.clearTimeout(pendingHandle);
      if (cancelled) return;
      const next: Row[] = MODELS.map((m) => {
        const inputTokens = counts.get(m.id) ?? 0;
        const { inputUsd, outputUsd, totalUsd } = costUsd(m, inputTokens, outputTokens);
        return { model: m, inputTokens, inputUsd, outputUsd, totalUsd };
      }).sort((a, b) => a.totalUsd - b.totalUsd);
      setRows(next);
      setPending(false);
    });
    return () => {
      cancelled = true;
      window.clearTimeout(pendingHandle);
    };
  }, [text, outputTokens]);

  if (text.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-(--border) bg-(--surface) p-6 text-center text-sm text-(--text-faint)">
        Paste a prompt to compare cost across all {MODELS.length} models.
      </div>
    );
  }

  const cheapest = rows[0]?.totalUsd ?? 0;

  return (
    <div className="overflow-x-auto rounded-xl border border-(--border) bg-(--surface)">
      <table className="w-full min-w-[20rem] text-sm">
        <thead className="bg-(--bg)/60 text-(--text-faint)">
          <tr>
            <th className="px-3 py-2.5 text-left text-eyebrow sm:px-4">Model</th>
            <th className="px-3 py-2.5 text-right text-eyebrow sm:px-4">Tokens</th>
            <th className="hidden px-3 py-2.5 text-right text-eyebrow sm:px-4 sm:table-cell">In</th>
            <th className="hidden px-3 py-2.5 text-right text-eyebrow sm:px-4 sm:table-cell">
              Out
            </th>
            <th className="px-3 py-2.5 text-right text-eyebrow sm:px-4">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const selected = r.model.id === selectedModelId;
            const ratio = cheapest > 0 ? r.totalUsd / cheapest : 1;
            return (
              <tr
                key={r.model.id}
                onClick={() => onSelect(r.model.id)}
                className={`cursor-pointer border-t border-(--border) transition-colors hover:bg-(--bg)/50 ${
                  selected ? "bg-(--accent)/8" : ""
                }`}
              >
                <td className="px-3 py-3 sm:px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-(--text)">{r.model.label}</span>
                    {selected && (
                      <span className="rounded-full border border-(--accent)/40 bg-(--accent)/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-(--accent)">
                        Selected
                      </span>
                    )}
                    {!selected && r.model.id === rows[0].model.id && (
                      <span className="rounded-full border border-(--gold)/40 bg-(--gold)/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-(--gold)">
                        Cheapest
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-(--text-faint)">{r.model.family}</div>
                </td>
                <td
                  className="px-3 py-3 text-right tabular-nums text-(--text-muted) sm:px-4"
                  data-clarity-mask="true"
                >
                  {formatNumber(r.inputTokens)}
                </td>
                <td
                  className="hidden px-4 py-3 text-right tabular-nums text-(--text-muted) sm:table-cell"
                  data-clarity-mask="true"
                >
                  {formatUsd(r.inputUsd)}
                </td>
                <td
                  className="hidden px-4 py-3 text-right tabular-nums text-(--text-muted) sm:table-cell"
                  data-clarity-mask="true"
                >
                  {formatUsd(r.outputUsd)}
                </td>
                <td className="px-3 py-3 text-right sm:px-4" data-clarity-mask="true">
                  <span
                    className={`font-mono tabular-nums ${selected || r.model.id === rows[0].model.id ? "text-(--gold)" : "text-(--text)"}`}
                  >
                    {formatUsd(r.totalUsd)}
                  </span>
                  {ratio > 1 && (
                    <span className="ml-2 text-xs text-(--text-faint)">{ratio.toFixed(1)}×</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {pending && (
        <div className="border-t border-(--border) bg-(--bg)/40 px-4 py-2 text-xs text-(--text-faint)">
          Recomputing…
        </div>
      )}
    </div>
  );
}

function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
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
