import type { Metadata } from 'next';
import { AffiliateSlot } from '@/components/AffiliateSlot';
import { buildMetadata } from '@/lib/seo';
import { MODELS, latestDataAsOf, type Vendor } from '@/lib/pricing';

export const metadata: Metadata = buildMetadata({
  title: 'Pricing data',
  description:
    'Where tokenmath sources its pricing data, with direct links to each vendor’s pricing page and the date each entry was last verified.',
  path: '/pricing-data',
});

const VENDOR_INFO: Record<Vendor, { name: string; pricingUrl: string; note: string }> = {
  anthropic: {
    name: 'Anthropic',
    pricingUrl: 'https://www.anthropic.com/pricing',
    note: 'Per-million pricing for Claude models, plus prompt-caching discount tiers.',
  },
  google: {
    name: 'Google',
    pricingUrl: 'https://ai.google.dev/pricing',
    note: 'Gemini API pricing — note the tiered rate above 200,000 input tokens for Pro.',
  },
  openai: {
    name: 'OpenAI',
    pricingUrl: 'https://openai.com/api/pricing/',
    note: 'GPT-5 / GPT-4.1 / o-series pricing, plus cached-input discount rates.',
  },
};

export default function PricingDataPage() {
  const vendors = Array.from(new Set(MODELS.map((m) => m.vendor)));

  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10 sm:py-16"
    >
      <article className="prose prose-invert max-w-none prose-headings:tracking-tight prose-a:text-(--accent) prose-a:no-underline">
        <h1>Pricing data</h1>

        <p>
          Every price in tokenmath comes from the vendor&apos;s own public pricing page — links
          below. Each entry is stamped with a <code>dataAsOf</code> date showing when we last
          reconciled it against the source. Most recent verification across all entries:{' '}
          <strong>{latestDataAsOf()}</strong>.
        </p>

        <h2>Vendor sources</h2>

        <p>Click through to verify any rate against the original source:</p>

        <div className="not-prose my-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {vendors.map((v) => {
            const info = VENDOR_INFO[v];
            return (
              <a
                key={v}
                href={info.pricingUrl}
                target="_blank"
                rel="noopener"
                className="block rounded-xl border border-(--border) bg-(--surface) p-4 hover:border-(--accent)"
              >
                <div className="text-sm font-medium">{info.name}</div>
                <div className="mt-1 text-xs text-(--text-muted)">{info.note}</div>
                <div className="mt-2 text-xs text-(--accent)">
                  {new URL(info.pricingUrl).host}
                  {new URL(info.pricingUrl).pathname.replace(/\/$/, '')} →
                </div>
              </a>
            );
          })}
        </div>

        <h2>Current table</h2>

        <p>
          The <em>Source</em> column links to the exact page each rate was verified from.
        </p>

        <div className="not-prose my-6 overflow-x-auto rounded-xl border border-(--border)">
          <table className="w-full text-sm">
            <thead className="bg-(--bg) text-(--text-muted)">
              <tr>
                <th className="px-4 py-2 text-left text-xs uppercase tracking-wide">Model</th>
                <th className="px-4 py-2 text-right text-xs uppercase tracking-wide">Input $/M</th>
                <th className="px-4 py-2 text-right text-xs uppercase tracking-wide">Output $/M</th>
                <th className="px-4 py-2 text-right text-xs uppercase tracking-wide">Context</th>
                <th className="whitespace-nowrap px-4 py-2 text-right text-xs uppercase tracking-wide">
                  Verified
                </th>
                <th className="px-4 py-2 text-right text-xs uppercase tracking-wide">Source</th>
              </tr>
            </thead>
            <tbody>
              {MODELS.map((m) => (
                <tr key={m.id} className="border-t border-(--border)">
                  <td className="px-4 py-3 font-medium">{m.label}</td>
                  <td className="px-4 py-3 text-right tabular-nums">${m.inputUsdPerM}</td>
                  <td className="px-4 py-3 text-right tabular-nums">${m.outputUsdPerM}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {m.contextWindow.toLocaleString('en-US')}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                    {m.dataAsOf}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a href={m.source} target="_blank" rel="noopener" className="text-(--accent)">
                      {new URL(m.source).host}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Tiered pricing</h2>

        <p>
          A few models charge different rates above a context threshold. The calculator applies the
          right tier automatically based on input size, but the breakdown is here for reference:
        </p>

        <ul>
          {MODELS.filter((m) => m.tiers && m.tiers.length > 0).map((m) => (
            <li key={m.id}>
              <strong>{m.label}</strong>:{' '}
              {m.tiers
                ?.map(
                  (t) =>
                    `${t.upTo === null ? 'above the threshold' : `≤ ${t.upTo.toLocaleString('en-US')} input tokens`}: $${t.inputUsdPerM} input / $${t.outputUsdPerM} output per 1M`,
                )
                .join('; ')}
              .
            </li>
          ))}
        </ul>

        <h2>Reporting an outdated price</h2>

        <p>
          If you spot a stale rate, email{' '}
          <a href="mailto:hello@tokenmath.dev">hello@tokenmath.dev</a> with the corrected number and
          a link to the vendor&apos;s pricing page. We typically ship a fix within a day.
        </p>
      </article>

      <AffiliateSlot placement="pricing-data-footer" />
    </main>
  );
}
