import type { Metadata } from "next";
import { AffiliateSlot } from "@/components/AffiliateSlot";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { MODELS, latestDataAsOf, type Vendor } from "@/lib/pricing";
import { ExternalLinkIcon } from "@/components/icons";

export const metadata: Metadata = buildMetadata({
  title: "Pricing data",
  description:
    "Where tokenmath sources its pricing data, with direct links to each vendor’s pricing page and the date each entry was last verified.",
  path: "/pricing-data",
});

const VENDOR_INFO: Record<Vendor, { name: string; pricingUrl: string; note: string }> = {
  anthropic: {
    name: "Anthropic",
    pricingUrl: "https://www.anthropic.com/pricing",
    note: "Per-million pricing for Claude models, plus prompt-caching discount tiers.",
  },
  google: {
    name: "Google",
    pricingUrl: "https://ai.google.dev/pricing",
    note: "Gemini API pricing — note the tiered rate above 200,000 input tokens for Pro.",
  },
  openai: {
    name: "OpenAI",
    pricingUrl: "https://openai.com/api/pricing/",
    note: "GPT-5 / GPT-4.1 / o-series pricing, plus cached-input discount rates.",
  },
};

export default function PricingDataPage() {
  const vendors = Array.from(new Set(MODELS.map((m) => m.vendor)));

  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10 sm:py-16"
    >
      <header className="flex flex-col gap-3">
        <p className="text-eyebrow text-(--accent)">Pricing data</p>
        <h1 className="text-display-lg">Every rate, dated and sourced.</h1>
        <p className="max-w-prose text-base text-(--text-muted) sm:text-lg">
          Every price in tokenmath comes from the vendor&apos;s own public pricing page — links
          below. Each entry is stamped with the date we last reconciled it against the source. Most
          recent verification across all entries:{" "}
          <span className="text-(--text)">{latestDataAsOf()}</span>.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-display">Vendor sources</h2>
        <p className="text-sm text-(--text-muted)">
          Click through to verify any rate against the original source.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {vendors.map((v) => {
            const info = VENDOR_INFO[v];
            return (
              <a
                key={v}
                href={info.pricingUrl}
                target="_blank"
                rel="noopener"
                className="group flex flex-col gap-2 rounded-xl border border-(--border) bg-(--surface) p-4 hover:border-(--accent)"
              >
                <div className="text-sm font-medium">{info.name}</div>
                <div className="text-xs text-(--text-muted)">{info.note}</div>
                <div className="mt-auto inline-flex items-center gap-1 text-xs text-(--accent)">
                  {new URL(info.pricingUrl).host}
                  <ExternalLinkIcon className="opacity-80 transition-opacity group-hover:opacity-100" />
                </div>
              </a>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-display">Current table</h2>
        <p className="text-sm text-(--text-muted)">
          The <em>Source</em> column links to the exact page each rate was verified from.
        </p>
        <div className="overflow-x-auto rounded-xl border border-(--border) bg-(--surface)">
          <table className="w-full text-sm">
            <thead className="bg-(--bg)/60 text-(--text-faint)">
              <tr>
                <th className="px-4 py-2.5 text-left text-eyebrow">Model</th>
                <th className="px-4 py-2.5 text-right text-eyebrow">Input $/M</th>
                <th className="px-4 py-2.5 text-right text-eyebrow">Output $/M</th>
                <th className="px-4 py-2.5 text-right text-eyebrow">Context</th>
                <th className="whitespace-nowrap px-4 py-2.5 text-right text-eyebrow">Verified</th>
                <th className="px-4 py-2.5 text-right text-eyebrow">Source</th>
              </tr>
            </thead>
            <tbody>
              {MODELS.map((m) => (
                <tr key={m.id} className="border-t border-(--border)">
                  <td className="px-4 py-3 font-medium text-(--text)">{m.label}</td>
                  <td className="px-4 py-3 text-right tabular-nums">${m.inputUsdPerM}</td>
                  <td className="px-4 py-3 text-right tabular-nums">${m.outputUsdPerM}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {m.contextWindow.toLocaleString("en-US")}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-(--text-muted)">
                    {m.dataAsOf}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={m.source}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1 text-(--accent)"
                    >
                      {new URL(m.source).host}
                      <ExternalLinkIcon className="opacity-70" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-display">Tiered pricing</h2>
        <p className="text-sm text-(--text-muted)">
          A few models charge different rates above a context threshold. The calculator applies the
          right tier automatically based on input size; the breakdown is here for reference.
        </p>
        <ul className="flex flex-col gap-2 rounded-xl border border-(--border) bg-(--surface) p-4 text-sm">
          {MODELS.filter((m) => m.tiers && m.tiers.length > 0).map((m) => (
            <li key={m.id} className="text-(--text-muted)">
              <strong className="text-(--text)">{m.label}</strong>:{" "}
              {m.tiers
                ?.map(
                  (t) =>
                    `${t.upTo === null ? "above the threshold" : `≤ ${t.upTo.toLocaleString("en-US")} input tokens`}: $${t.inputUsdPerM} input / $${t.outputUsdPerM} output per 1M`,
                )
                .join("; ")}
              .
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-display">Reporting an outdated price</h2>
        <p className="text-sm text-(--text-muted)">
          If you spot a stale rate, email{" "}
          <a href={`mailto:${siteConfig.supportEmail}`} className="text-(--accent) hover:underline">
            {siteConfig.supportEmail}
          </a>{" "}
          with the corrected number and a link to the vendor&apos;s pricing page. We typically ship
          a fix within a day — see the{" "}
          <a href="/changelog" className="text-(--accent) hover:underline">
            changelog
          </a>
          .
        </p>
      </section>

      <AffiliateSlot placement="pricing-data-footer" />
    </main>
  );
}
