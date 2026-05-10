'use client';

import { MODELS, type ModelId } from '@/lib/pricing';

interface ModelPickerProps {
  value: ModelId;
  onChange: (next: ModelId) => void;
  id?: string;
}

export function ModelPicker({ value, onChange, id }: ModelPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-xs uppercase tracking-wide text-(--text-muted)">
        Model
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as ModelId)}
        className="block w-full rounded-md border border-(--border) bg-(--surface) px-3 py-2 text-sm text-(--text) focus:border-(--accent) focus:outline-none"
      >
        {Object.entries(groupByVendor(MODELS)).map(([vendor, items]) => (
          <optgroup key={vendor} label={vendorLabel(vendor)}>
            {items.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} — ${m.inputUsdPerM}/${m.outputUsdPerM}/M
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

function groupByVendor<T extends { vendor: string }>(items: readonly T[]): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    (acc[item.vendor] ??= []).push(item);
    return acc;
  }, {});
}

function vendorLabel(v: string) {
  switch (v) {
    case 'anthropic':
      return 'Anthropic';
    case 'google':
      return 'Google';
    case 'openai':
      return 'OpenAI';
    default:
      return v;
  }
}
