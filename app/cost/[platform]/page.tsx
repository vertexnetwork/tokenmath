import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AdSlot } from "@/components/AdSlot";
import { Byline } from "@/components/Byline";
import {
  getPlatformBySlug,
  listPlatformSlugs,
  platformVerifiedDate,
  type Platform,
} from "@/lib/platforms";
import { siteConfig } from "@/lib/site-config";
import { breadcrumbListJsonLd, buildMetadata, faqPageJsonLd, renderJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return listPlatformSlugs().map((platform) => ({ platform }));
}

export async function generateMetadata(props: {
  params: Promise<{ platform: string }>;
}): Promise<Metadata> {
  const { platform: slug } = await props.params;
  const p = getPlatformBySlug(slug);
  if (!p) return buildMetadata();
  return buildMetadata({
    title: `${p.name} pricing explained: why your bill adds up`,
    description: `How ${p.name} actually charges — ${p.tagline} See the plans, how ${meteringNoun(p)} map to real token cost, and estimate your underlying API spend.`,
    path: `/cost/${p.slug}`,
    image: new URL(
      `/api/og?title=${encodeURIComponent(`${p.name} cost`)}&subtitle=${encodeURIComponent("Pricing explained")}`,
      siteConfig.url,
    ).toString(),
  });
}

function meteringNoun(p: Platform): string {
  switch (p.metering) {
    case "credits":
      return "credits";
    case "fast-requests":
      return "fast requests";
    case "byo-api-key":
      return "your API key’s tokens";
    case "usage-based":
      return "usage charges";
    case "subscription-flat":
      return "the flat plan";
  }
}

function fmtPlanPrice(price: number | null): string {
  if (price === null) return "Custom";
  if (price === 0) return "Free";
  return `$${price}`;
}

export default async function PlatformCostPage(props: { params: Promise<{ platform: string }> }) {
  const { platform: slug } = await props.params;
  const p = getPlatformBySlug(slug);
  if (!p) notFound();

  const faqs = [
    {
      q: `Why is my ${p.name} bill higher than expected?`,
      a: p.surpriseBillReason,
    },
    {
      q: `How do ${meteringNoun(p)} translate to actual cost?`,
      a: p.howItMaps,
    },
    {
      q: `Which models am I paying for on ${p.name}?`,
      a: `${p.name} runs on ${p.underlyingModels.join(", ")}. You can estimate the raw token cost of any prompt against those models in the tokenmath calculator.`,
    },
  ];

  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto flex w-full max-w-(--container-app) flex-1 flex-col gap-6 px-6 py-10 sm:py-16"
    >
      <nav aria-label="Breadcrumb" className="text-xs text-(--text-muted)">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-(--text)">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/cost" className="hover:text-(--text)">
              Platform costs
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-(--text)" aria-current="page">
            {p.name}
          </li>
        </ol>
      </nav>

      <Byline verified={platformVerifiedDate(p)} />

      <article className="prose prose-invert max-w-none prose-headings:tracking-tight prose-h1:text-3xl prose-h1:font-semibold prose-h2:mt-12 prose-h2:text-2xl prose-h2:font-semibold prose-a:text-(--accent) prose-a:no-underline prose-strong:text-(--text)">
        <h1>{p.name} pricing explained</h1>
        <p>{p.tagline}</p>

        <h2>The plans</h2>
        <div className="not-prose overflow-x-auto rounded-xl border border-(--border)">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-(--border) text-left text-(--text-muted)">
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {p.plans.map((plan) => (
                <tr key={plan.name} className="border-b border-(--border) last:border-0">
                  <td className="px-4 py-3 font-medium text-(--text)">{plan.name}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {fmtPlanPrice(plan.priceUsd)}
                    {plan.priceUsd !== null && plan.priceUsd > 0 && plan.period !== "once" && (
                      <span className="text-(--text-faint)">/{plan.period}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-(--text-muted)">{plan.note ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Why the bill surprises people</h2>
        <p>{p.surpriseBillReason}</p>

        <h2>How {meteringNoun(p)} map to real token cost</h2>
        <p>{p.howItMaps}</p>
        <p>
          {p.name} runs on <strong>{p.underlyingModels.join(", ")}</strong>. To see what your actual
          prompts cost at the API level — and which model is cheapest for your workload — paste one
          into the <Link href="/#calculator">calculator</Link>.
        </p>

        <h2>FAQ</h2>
        <dl>
          {faqs.map((faq) => (
            <div key={faq.q}>
              <dt className="font-semibold text-(--text)">{faq.q}</dt>
              <dd>{faq.a}</dd>
            </div>
          ))}
        </dl>

        <p className="text-xs text-(--text-faint)">
          Pricing sourced from{" "}
          <a href={p.source} rel="nofollow noopener" target="_blank">
            {p.name}’s official pricing
          </a>{" "}
          as of {p.lastVerified ?? p.dataAsOf}. Platform pricing changes often — verify before you
          commit.
        </p>
      </article>

      <AdSlot placement="pseo-after-faq" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(faqPageJsonLd(faqs))}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(
          breadcrumbListJsonLd([
            { name: "Home", path: "/" },
            { name: "Platform costs", path: "/cost" },
            { name: p.name, path: `/cost/${p.slug}` },
          ]),
        )}
      />
    </main>
  );
}
