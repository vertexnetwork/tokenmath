'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  APPROX_DRIFT,
  DEFAULT_MODEL_ID,
  MODELS,
  type ModelId,
  type ModelPricing,
  type Vendor,
} from '@/lib/pricing';
import { ArrowRightIcon, CompareIcon, XIcon } from './icons';

/**
 * Models index in browse mode: sort + vendor filter + multi-select compare. The compare
 * panel is in-page (no route change) — it shows the selected models in a single table with
 * pricing, context window, drift, and a deep-link into the per-model calculator.
 */

type Sort = 'cost-asc' | 'cost-desc' | 'context-desc' | 'name-asc';

const VENDORS: Array<{ id: Vendor; label: string }> = [
  { id: 'anthropic', label: 'Anthropic' },
  { id: 'openai', label: 'OpenAI' },
  { id: 'google', label: 'Google' },
];

const VENDOR_BLURB: Record<Vendor, string> = {
  anthropic: APPROX_DRIFT.anthropic.blurb,
  openai: APPROX_DRIFT.openai.blurb,
  google: APPROX_DRIFT.google.blurb,
};

export function ModelsBrowser() {
  const [sort, setSort] = useState<Sort>('cost-asc');
  const [activeVendors, setActiveVendors] = useState<Set<Vendor>>(
    () => new Set(['anthropic', 'openai', 'google']),
  );
  const [selected, setSelected] = useState<Set<ModelId>>(new Set());
  const [comparing, setComparing] = useState(false);

  const filtered = useMemo(() => {
    const list = MODELS.filter((m) => activeVendors.has(m.vendor));
    return sortModels(list, sort);
  }, [sort, activeVendors]);

  const toggleVendor = (v: Vendor) => {
    setActiveVendors((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      // At least one vendor must always be active to keep the page useful.
      if (next.size === 0) return new Set(['anthropic']);
      return next;
    });
  };

  const toggleSelected = (id: ModelId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedModels = MODELS.filter((m) => selected.has(m.id));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 border-b border-(--border) pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-eyebrow text-(--text-muted)">Vendor</span>
          {VENDORS.map((v) => {
            const active = activeVendors.has(v.id);
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => toggleVendor(v.id)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  active
                    ? 'border-(--accent) bg-(--accent)/10 text-(--accent)'
                    : 'border-(--border) text-(--text-muted) hover:border-(--accent)/60 hover:text-(--text)'
                }`}
              >
                {v.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-eyebrow text-(--text-muted)">
            Sort
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-md border border-(--border) bg-(--surface) px-2 py-1 text-xs text-(--text) focus:border-(--accent) focus:outline-none"
          >
            <option value="cost-asc">Input cost · low → high</option>
            <option value="cost-desc">Input cost · high → low</option>
            <option value="context-desc">Context window · widest first</option>
            <option value="name-asc">Name · A → Z</option>
          </select>
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => (
          <ModelCard
            key={m.id}
            model={m}
            checked={selected.has(m.id)}
            onCheck={() => toggleSelected(m.id)}
          />
        ))}
      </ul>

      {VENDORS.filter((v) => activeVendors.has(v.id)).map((v) => (
        <p key={v.id} className="hidden">
          {v.label}: {VENDOR_BLURB[v.id]}
        </p>
      ))}

      {selectedModels.length > 0 && (
        <CompareDock
          selected={selectedModels}
          onClear={() => setSelected(new Set())}
          onCompare={() => setComparing(true)}
        />
      )}

      {comparing && (
        <ComparePanel models={selectedModels} onClose={() => setComparing(false)} />
      )}
    </div>
  );
}

function ModelCard({
  model,
  checked,
  onCheck,
}: {
  model: ModelPricing;
  checked: boolean;
  onCheck: () => void;
}) {
  return (
    <li className="relative">
      <label className="absolute left-3 top-3 inline-flex cursor-pointer items-center gap-2 rounded-md bg-(--surface)/95 px-1.5 py-1 text-xs text-(--text-muted)">
        <input
          type="checkbox"
          checked={checked}
          onChange={onCheck}
          className="size-3.5 accent-(--accent)"
          aria-label={`Select ${model.label} for comparison`}
        />
        Compare
      </label>
      <Link
        href={`/token-calculator/${model.slug}`}
        className="flex h-full flex-col rounded-xl border border-(--border) bg-(--surface) p-4 pt-12 transition-colors hover:border-(--accent)"
      >
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-medium text-(--text)">{model.label}</span>
          <span className="text-xs text-(--text-faint)">{model.family}</span>
        </div>
        {model.id === DEFAULT_MODEL_ID && (
          <span className="mt-2 inline-flex w-fit items-center rounded-full border border-(--accent)/40 bg-(--accent)/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-(--accent)">
            Calculator default
          </span>
        )}
        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-(--text-muted)">
          <dt>Input</dt>
          <dd className="text-right tabular-nums text-(--text)">${model.inputUsdPerM}/M</dd>
          <dt>Output</dt>
          <dd className="text-right tabular-nums text-(--text)">${model.outputUsdPerM}/M</dd>
          <dt>Context</dt>
          <dd className="text-right tabular-nums text-(--text)">
            {model.contextWindow.toLocaleString('en-US')}
          </dd>
          {model.tiers && (
            <>
              <dt>Tiered</dt>
              <dd className="text-right text-(--gold)">yes</dd>
            </>
          )}
        </dl>
        <span className="mt-3 inline-flex items-center gap-1 text-xs text-(--accent)">
          Open calculator <ArrowRightIcon />
        </span>
      </Link>
    </li>
  );
}

function CompareDock({
  selected,
  onClear,
  onCompare,
}: {
  selected: ModelPricing[];
  onClear: () => void;
  onCompare: () => void;
}) {
  return (
    <div className="sticky bottom-4 z-10 mx-auto flex w-full max-w-(--container-app) flex-wrap items-center justify-between gap-3 rounded-xl border border-(--border) bg-(--surface-2)/95 px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur">
      <span className="text-sm text-(--text-muted)">
        <span className="text-(--text)">{selected.length} selected</span> ·{' '}
        {selected.map((s) => s.label).join(', ')}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClear}
          className="rounded-md border border-(--border) px-3 py-1.5 text-xs text-(--text-muted) hover:border-(--accent) hover:text-(--text)"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={onCompare}
          disabled={selected.length < 2}
          className="inline-flex items-center gap-2 rounded-md border border-(--accent)/40 bg-(--accent)/10 px-3 py-1.5 text-xs font-medium text-(--accent) hover:border-(--accent) disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CompareIcon />
          Compare {selected.length}
        </button>
      </div>
    </div>
  );
}

function ComparePanel({
  models,
  onClose,
}: {
  models: ModelPricing[];
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex w-full max-w-3xl flex-col rounded-2xl border border-(--border) bg-(--surface-2) p-6 sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-display">Comparing {models.length} models</h2>
            <p className="mt-1 text-sm text-(--text-muted)">
              Pricing snapshot at the model level. For a side-by-side against an actual
              prompt, paste it into the calculator and toggle compare mode.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close comparison"
            className="-mr-2 -mt-1 inline-flex h-9 w-9 items-center justify-center rounded-md text-(--text-muted) hover:bg-(--bg) hover:text-(--text)"
          >
            <XIcon />
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-(--text-faint)">
              <tr className="border-b border-(--border)">
                <th className="py-2 pr-4 text-left text-eyebrow">Model</th>
                <th className="py-2 pr-4 text-right text-eyebrow">Input $/M</th>
                <th className="py-2 pr-4 text-right text-eyebrow">Output $/M</th>
                <th className="py-2 pr-4 text-right text-eyebrow">Context</th>
                <th className="py-2 text-right text-eyebrow">Drift</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m) => (
                <tr key={m.id} className="border-b border-(--border)/60 last:border-b-0">
                  <td className="py-3 pr-4">
                    <Link
                      href={`/token-calculator/${m.slug}`}
                      className="text-(--text) hover:text-(--accent)"
                    >
                      {m.label}
                    </Link>
                    <div className="text-xs text-(--text-faint)">{m.family}</div>
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums">${m.inputUsdPerM}</td>
                  <td className="py-3 pr-4 text-right tabular-nums">${m.outputUsdPerM}</td>
                  <td className="py-3 pr-4 text-right tabular-nums">
                    {m.contextWindow.toLocaleString('en-US')}
                  </td>
                  <td className="py-3 text-right text-(--text-faint)">
                    {APPROX_DRIFT[m.vendor].label}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function sortModels(list: readonly ModelPricing[], sort: Sort): ModelPricing[] {
  const sorted = [...list];
  switch (sort) {
    case 'cost-asc':
      return sorted.sort((a, b) => a.inputUsdPerM - b.inputUsdPerM);
    case 'cost-desc':
      return sorted.sort((a, b) => b.inputUsdPerM - a.inputUsdPerM);
    case 'context-desc':
      return sorted.sort((a, b) => b.contextWindow - a.contextWindow);
    case 'name-asc':
      return sorted.sort((a, b) => a.label.localeCompare(b.label));
  }
}
