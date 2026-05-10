import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';
import {
  APPROX_DRIFT,
  DEFAULT_MODEL_ID,
  MODELS,
  type ModelId,
  type ModelPricing,
  type Vendor,
} from '@/lib/pricing';

export const metadata: Metadata = buildMetadata({
  title: 'All models',
  description:
    'Every model tokenmath supports — Claude, Gemini, and OpenAI — with current pricing and a one-click jump into a per-model calculator.',
  path: '/models',
});

const VENDOR_ORDER: Vendor[] = ['anthropic', 'openai', 'google'];

const VENDOR_LABEL: Record<Vendor, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  google: 'Google',
};

const VENDOR_BLURB: Record<Vendor, string> = {
  anthropic: `Claude 4.5 + 4.7 family. ${APPROX_DRIFT.anthropic.blurb}`,
  openai: `GPT-5 + GPT-4.1 family. ${APPROX_DRIFT.openai.blurb}`,
  google: `Gemini 2.5 family. ${APPROX_DRIFT.google.blurb}`,
};

type Badge = { label: string; tone: 'accent' | 'muted' };

/**
 * Pick a single objective signal per card to break visual sameness on the index. Priority:
 * 1. The home-page default model
 * 2. The cheapest input price within its vendor
 * 3. The largest context window within its vendor
 * Falls back to no badge if a model wins on none of these.
 */
function badgeFor(model: ModelPricing, peers: readonly ModelPricing[]): Badge | null {
  if (model.id === DEFAULT_MODEL_ID) return { label: 'Calculator default', tone: 'accent' };
  const cheapest = peers.reduce<ModelId | null>(
    (best, m) =>
      best === null || m.inputUsdPerM < (peers.find((p) => p.id === best)?.inputUsdPerM ?? Infinity)
        ? m.id
        : best,
    null,
  );
  if (cheapest === model.id) return { label: 'Lowest input $', tone: 'muted' };
  const widest = peers.reduce<ModelId | null>(
    (best, m) =>
      best === null ||
      m.contextWindow > (peers.find((p) => p.id === best)?.contextWindow ?? -Infinity)
        ? m.id
        : best,
    null,
  );
  if (widest === model.id) return { label: 'Widest context', tone: 'muted' };
  return null;
}

export default function ModelsPage() {
  const grouped = VENDOR_ORDER.map((vendor) => ({
    vendor,
    items: MODELS.filter((m) => m.vendor === vendor),
  })).filter((g) => g.items.length > 0);

  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto flex w-full max-w-(--container-app) flex-1 flex-col gap-10 px-6 py-10 sm:py-16"
    >
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">All models</h1>
        <p className="max-w-2xl text-base text-(--text-muted) sm:text-lg">
          Every model tokenmath supports, grouped by vendor. Click any card to jump into a
          per-model calculator with worked examples and a pricing table.
        </p>
      </header>

      {grouped.map(({ vendor, items }) => (
        <section key={vendor} className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{VENDOR_LABEL[vendor]}</h2>
            <p className="mt-1 text-sm text-(--text-muted)">{VENDOR_BLURB[vendor]}</p>
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((m) => {
              const badge = badgeFor(m, items);
              return (
              <li key={m.id}>
                <Link
                  href={`/token-calculator/${m.slug}`}
                  className="flex h-full flex-col rounded-xl border border-(--border) bg-(--surface) p-4 transition-colors hover:border-(--accent)"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium">{m.label}</span>
                    <span className="text-xs text-(--text-muted)">{m.family}</span>
                  </div>
                  {badge && (
                    <span
                      className={`mt-2 inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                        badge.tone === 'accent'
                          ? 'border-(--accent)/40 bg-(--accent)/10 text-(--accent)'
                          : 'border-(--border) text-(--text-muted)'
                      }`}
                    >
                      {badge.label}
                    </span>
                  )}
                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-(--text-muted)">
                    <dt>Input</dt>
                    <dd className="text-right tabular-nums text-(--text)">${m.inputUsdPerM}/M</dd>
                    <dt>Output</dt>
                    <dd className="text-right tabular-nums text-(--text)">${m.outputUsdPerM}/M</dd>
                    <dt>Context</dt>
                    <dd className="text-right tabular-nums text-(--text)">
                      {m.contextWindow.toLocaleString('en-US')}
                    </dd>
                    {m.tiers && (
                      <>
                        <dt>Tiered</dt>
                        <dd className="text-right text-(--accent-2)">yes</dd>
                      </>
                    )}
                  </dl>
                  <span className="mt-3 text-xs text-(--accent)">Open calculator →</span>
                </Link>
              </li>
              );
            })}
          </ul>
        </section>
      ))}
    </main>
  );
}
