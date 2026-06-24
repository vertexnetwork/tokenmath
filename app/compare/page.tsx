import Link from "next/link";
import type { Metadata } from "next";
import { MODELS } from "@/lib/pricing";
import { pairSlug, formatPerM } from "@/lib/compare";
import { buildMetadata, breadcrumbListJsonLd, renderJsonLd } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Compare LLM pricing: every model, side by side",
    description:
      "Side-by-side token cost comparisons for every Claude, Gemini, and GPT model — input/output price, context window, and accuracy. Free, in your browser.",
    path: "/compare",
  });
}

export default function CompareIndexPage() {
  const pairs: { slug: string; aLabel: string; bLabel: string }[] = [];
  for (let i = 0; i < MODELS.length; i++) {
    for (let j = i + 1; j < MODELS.length; j++) {
      pairs.push({
        slug: pairSlug(MODELS[i].slug, MODELS[j].slug),
        aLabel: MODELS[i].label,
        bLabel: MODELS[j].label,
      });
    }
  }

  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto flex w-full max-w-(--container-app) flex-1 flex-col gap-8 px-6 py-10 sm:py-16"
    >
      <header className="flex flex-col gap-4">
        <p className="text-eyebrow text-(--accent)">Compare</p>
        <h1 className="text-display-lg max-w-3xl">Compare LLM pricing, side by side.</h1>
        <p className="max-w-2xl text-base text-(--text-muted) sm:text-lg">
          Pick any two models to see input/output cost, context window, accuracy, and what a
          real request actually costs on each. Every number is computed from our verified
          pricing table — no estimates.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-eyebrow text-(--text-muted)">Per-model headline rates</h2>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {MODELS.map((m) => (
            <li key={m.slug}>
              <Link
                href={`/token-calculator/${m.slug}`}
                className="flex items-center justify-between rounded-lg border border-(--border) bg-(--surface) px-4 py-3 text-sm hover:border-(--accent)"
              >
                <span className="font-medium text-(--text)">{m.label}</span>
                <span className="tabular-nums text-(--text-muted)">
                  {formatPerM(m.inputUsdPerM)}/{formatPerM(m.outputUsdPerM)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-eyebrow text-(--text-muted)">All comparisons ({pairs.length})</h2>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {pairs.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/compare/${p.slug}`}
                className="block rounded-lg border border-(--border) bg-(--surface) px-4 py-3 text-sm text-(--text-muted) hover:border-(--accent) hover:text-(--text)"
              >
                {p.aLabel} <span className="text-(--text-faint)">vs</span> {p.bLabel}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(
          breadcrumbListJsonLd([
            { name: "Home", path: "/" },
            { name: "Compare", path: "/compare" },
          ]),
        )}
      />
    </main>
  );
}
