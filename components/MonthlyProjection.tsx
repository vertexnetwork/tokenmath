"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { costUsd, MODELS, type ModelPricing } from "@/lib/pricing";
import { countAllModels } from "@/lib/tokenizers";
import { pairSlug } from "@/lib/compare";
import { events } from "@/lib/analytics";
import { ArrowRightIcon } from "./icons";

/**
 * The cost-decoder: turns the calculator from a one-shot "what does this prompt cost" tool
 * into "what's my monthly bill, and what should I switch to." This is the actual
 * job-to-be-done for both the API developer and the vibe coder — the single-request number
 * is a proxy for the spend that compounds across volume. Reuses `countAllModels` (3
 * tokenizations, not 12) so the cheapest-model suggestion is free.
 */
interface MonthlyProjectionProps {
  text: string;
  outputTokens: number;
  model: ModelPricing;
}

const VOLUME_PRESETS = [1_000, 10_000, 100_000];
const DEFAULT_VOLUME = 10_000;
const MAX_VOLUME = 1_000_000_000;

interface Computed {
  currentPerRequest: number;
  cheapest: { model: ModelPricing; perRequest: number };
}

export function MonthlyProjection({ text, outputTokens, model }: MonthlyProjectionProps) {
  const [volume, setVolume] = useState<number>(DEFAULT_VOLUME);
  const [computed, setComputed] = useState<Computed | null>(null);

  useEffect(() => {
    // No synchronous reset here — the render guard below hides the section when text is empty,
    // so we never need to setState in the effect body (react-hooks/set-state-in-effect). The
    // only state write happens in the async callback, matching CompareTable.
    if (text.length === 0) return;
    let cancelled = false;
    countAllModels(text).then((counts) => {
      if (cancelled) return;
      let cheapest: { model: ModelPricing; perRequest: number } | null = null;
      let currentPerRequest = 0;
      for (const m of MODELS) {
        const tokens = counts.get(m.id) ?? 0;
        const perRequest = costUsd(m, tokens, outputTokens).totalUsd;
        if (m.id === model.id) currentPerRequest = perRequest;
        if (!cheapest || perRequest < cheapest.perRequest) cheapest = { model: m, perRequest };
      }
      if (cheapest) setComputed({ currentPerRequest, cheapest });
    });
    return () => {
      cancelled = true;
    };
  }, [text, outputTokens, model.id]);

  if (text.length === 0 || !computed) return null;

  const monthlyCurrent = computed.currentPerRequest * volume;
  const monthlyCheapest = computed.cheapest.perRequest * volume;
  const savings = monthlyCurrent - monthlyCheapest;
  const isOnCheapest = computed.cheapest.model.id === model.id;
  // Only nudge a switch when the saving is real money at the chosen volume.
  const worthSwitching = !isOnCheapest && savings >= 0.01;

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-(--border) bg-(--surface) p-6 sm:p-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-eyebrow text-(--text-muted)">Monthly projection</h2>
        <p className="text-sm text-(--text-faint)">
          What this prompt costs at scale — and the cheapest model that handles the same workload.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="monthly-volume" className="text-eyebrow text-(--text-muted)">
          Requests per month
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <input
            id="monthly-volume"
            type="number"
            min={0}
            max={MAX_VOLUME}
            step={1_000}
            value={volume}
            onChange={(e) => {
              const next = Number.parseInt(e.target.value, 10);
              setVolume(Number.isFinite(next) ? Math.max(0, Math.min(next, MAX_VOLUME)) : 0);
            }}
            className="w-36 rounded-md border border-(--border) bg-(--bg) px-3 py-2 text-sm tabular-nums text-(--text) focus:border-(--accent) focus:outline-none"
          />
          <div className="flex gap-1" role="group" aria-label="Volume presets">
            {VOLUME_PRESETS.map((n) => {
              const active = volume === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setVolume(n)}
                  aria-pressed={active}
                  className={`rounded-md border px-2 py-1 text-xs tabular-nums transition-colors ${
                    active
                      ? "border-(--accent) bg-(--accent)/10 text-(--accent)"
                      : "border-(--border) text-(--text-muted) hover:border-(--accent) hover:text-(--text)"
                  }`}
                >
                  {formatCompact(n)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <div className="text-eyebrow text-(--text-muted)">{model.label} / month</div>
          <div
            className="result-num mt-1 text-display-md tabular-nums text-(--text)"
            data-clarity-mask="true"
          >
            {formatUsd(monthlyCurrent)}
          </div>
        </div>
        {worthSwitching && (
          <div>
            <div className="text-eyebrow text-(--text-muted)">
              {computed.cheapest.model.label} / month
            </div>
            <div
              className="result-num mt-1 text-display-md tabular-nums text-(--gold)"
              data-clarity-mask="true"
            >
              {formatUsd(monthlyCheapest)}
            </div>
          </div>
        )}
      </div>

      {worthSwitching ? (
        <div className="flex flex-col gap-3 rounded-xl border border-(--gold)/30 bg-(--gold)/8 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-(--text)">
            Switching to <strong>{computed.cheapest.model.label}</strong> saves about{" "}
            <strong className="text-(--gold)">{formatUsd(savings)}/mo</strong> on this workload
            {savings >= 1 ? ` (${formatUsd(savings * 12)}/yr).` : "."}
          </p>
          <Link
            href={`/compare/${pairSlug(model.slug, computed.cheapest.model.slug)}`}
            onClick={() => events.switchSuggested(model.id, computed.cheapest.model.id)}
            className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-md border border-(--gold)/40 bg-(--gold)/10 px-3 py-2 text-sm font-medium text-(--gold) hover:border-(--gold)"
          >
            Compare them
            <ArrowRightIcon />
          </Link>
        </div>
      ) : (
        <p className="rounded-xl border border-(--border) bg-(--bg) p-4 text-sm text-(--text-muted)">
          {model.label} is already the cheapest model for this workload. Nice.
        </p>
      )}
    </section>
  );
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${n / 1_000_000}M`;
  if (n >= 1_000) return `${n / 1_000}k`;
  return `${n}`;
}

function formatUsd(n: number): string {
  if (n === 0) return "$0.00";
  if (n < 0.01) return "<$0.01";
  if (n < 1) return `$${n.toFixed(3)}`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}
