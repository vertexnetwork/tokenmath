import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { MODELS, latestDataAsOf } from '@/lib/pricing';

export const metadata: Metadata = buildMetadata({
  title: 'Pricing data',
  description: 'Where tokencount sources its pricing data, and when each entry was last verified.',
  path: '/pricing-data',
});

export default function PricingDataPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10 sm:py-16">
      <article className="prose prose-invert max-w-none prose-headings:tracking-tight prose-a:text-(--accent) prose-a:no-underline">
        <h1>Pricing data</h1>

        <p>
          Pricing values used in this calculator are pulled from each vendor&apos;s public pricing
          page and stamped with the date they were last verified. Most recent verification across
          all entries: <strong>{latestDataAsOf()}</strong>.
        </p>

        <p>
          When a vendor announces a price change, we update <code>lib/pricing.ts</code> in the
          source repository and ship a deploy. The <code>dataAsOf</code> field below reflects the
          most recent reconciliation against the vendor&apos;s site, not the date the price itself
          last changed.
        </p>

        <h2>Current table</h2>

        <div className="not-prose my-6 overflow-x-auto rounded-xl border border-(--border)">
          <table className="w-full text-sm">
            <thead className="bg-(--bg) text-(--text-muted)">
              <tr>
                <th className="px-4 py-2 text-left text-xs uppercase tracking-wide">Model</th>
                <th className="px-4 py-2 text-right text-xs uppercase tracking-wide">Input $/M</th>
                <th className="px-4 py-2 text-right text-xs uppercase tracking-wide">Output $/M</th>
                <th className="px-4 py-2 text-right text-xs uppercase tracking-wide">Context</th>
                <th className="px-4 py-2 text-right text-xs uppercase tracking-wide">Verified</th>
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
                  <td className="px-4 py-3 text-right tabular-nums">{m.dataAsOf}</td>
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
          If you spot a stale rate, open an issue on the{' '}
          <a
            href="https://github.com/ThatMovieGuyOriginal/tokencount"
            target="_blank"
            rel="noopener"
          >
            GitHub repository
          </a>{' '}
          with the corrected number and a link to the vendor&apos;s pricing page. We typically merge
          fixes within a day.
        </p>
      </article>
    </main>
  );
}
