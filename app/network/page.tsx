import type { Metadata } from "next";
import { buildMetadata, renderJsonLd } from "@/lib/seo";
import { listSiblings, loadNetwork } from "@/lib/network";
import { siteConfig } from "@/lib/site-config";
import { ExternalLinkIcon } from "@/components/icons";

export const metadata: Metadata = buildMetadata({
  title: "Vertex Network",
  description: `${siteConfig.name} is one of several indie tools sharing a common stack and design language.`,
  path: "/network",
});

function networkCollectionJsonLd(siblings: ReturnType<typeof listSiblings>) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Vertex Network",
    description:
      "A small set of independent indie tools sharing a common stack and design language.",
    url: new URL("/network", siteConfig.url).toString(),
    hasPart: siblings.map((site) => ({
      "@type": "WebSite",
      name: site.name,
      url: site.url,
      description: site.description,
    })),
  } as const;
}

export default function NetworkPage() {
  const network = loadNetwork();
  const siblings = listSiblings(siteConfig.url);

  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto flex w-full max-w-(--container-app) flex-1 flex-col gap-10 px-6 py-10 sm:py-16"
    >
      <header className="flex flex-col gap-3">
        <p className="text-eyebrow text-(--accent)">Network</p>
        <h1 className="text-display-lg">{network.brand}.</h1>
        <p className="max-w-2xl text-base text-(--text-muted) sm:text-lg">
          {siteConfig.name} is one of {siblings.length + 1} indie tools sharing a common stack and
          design language. Each runs independently — no shared accounts, no cross-tracking, no
          upsell funnel between them.
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {siblings.map((site) => (
          <li key={site.slug}>
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col gap-3 rounded-xl border border-(--border) bg-(--surface) p-5 transition-colors hover:border-(--accent)"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-base font-medium text-(--text)">{site.name}</span>
                <span className="inline-flex items-center gap-1 text-xs text-(--text-muted)">
                  {site.domain}
                  <ExternalLinkIcon className="opacity-60 transition-opacity group-hover:opacity-100" />
                </span>
              </div>
              <p className="text-sm text-(--text-muted)">{site.description}</p>
              <p className="mt-auto text-xs text-(--text-faint)">For {site.audience}.</p>
            </a>
          </li>
        ))}
      </ul>

      <section className="flex flex-col gap-3 border-t border-(--border) pt-8">
        <h2 className="text-display">What ties them together</h2>
        <p className="max-w-prose text-base text-(--text-muted)">
          Same Next.js + Tailwind chassis, same hamburger header, same zero-tracking contract on
          prompt-like input. Different products. Built and maintained by the same person.
        </p>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(networkCollectionJsonLd(siblings))}
      />
    </main>
  );
}
