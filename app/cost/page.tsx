import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PLATFORMS } from "@/lib/platforms";
import { buildMetadata, breadcrumbListJsonLd, renderJsonLd } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "AI tool pricing explained: Cursor, Replit, Lovable & more",
    description:
      "Why your AI coding bill adds up — how credits, fast requests, and usage charges map to real token cost across the popular AI builders. Estimate your underlying API spend.",
    path: "/cost",
  });
}

export default function PlatformCostIndex() {
  // Until any platform is verified + populated, this axis publishes nothing — keep it out of
  // the indexable surface rather than shipping an empty page.
  if (PLATFORMS.length === 0) notFound();

  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto flex w-full max-w-(--container-app) flex-1 flex-col gap-8 px-6 py-10 sm:py-16"
    >
      <header className="flex flex-col gap-4">
        <p className="text-eyebrow text-(--accent)">Platform costs</p>
        <h1 className="text-display-lg max-w-3xl">Why your AI tool bill adds up.</h1>
        <p className="max-w-2xl text-base text-(--text-muted) sm:text-lg">
          The AI coding tools meter cost in credits, “fast requests,” and usage charges that don’t
          obviously map to dollars. Here’s how each one actually bills — and how to estimate the
          real token cost underneath.
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PLATFORMS.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/cost/${p.slug}`}
              className="flex flex-col gap-1 rounded-xl border border-(--border) bg-(--surface) px-4 py-4 hover:border-(--accent)"
            >
              <span className="font-medium text-(--text)">{p.name}</span>
              <span className="text-sm text-(--text-muted)">{p.tagline}</span>
            </Link>
          </li>
        ))}
      </ul>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(
          breadcrumbListJsonLd([
            { name: "Home", path: "/" },
            { name: "Platform costs", path: "/cost" },
          ]),
        )}
      />
    </main>
  );
}
