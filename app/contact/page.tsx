import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description: `Email tokenmath. We respond to most messages within a day.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10 sm:py-16"
    >
      <header className="flex flex-col gap-3">
        <p className="text-eyebrow text-(--accent)">Contact</p>
        <h1 className="text-display-lg">Get in touch.</h1>
      </header>

      <article className="prose max-w-none prose-headings:tracking-tight">
        <p>
          The fastest way to reach {siteConfig.name} is by email:{" "}
          <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
        </p>

        <p>We typically respond within a day. Good things to email about:</p>
        <ul>
          <li>An outdated vendor price (a link to the source page is gold)</li>
          <li>A model you&apos;d like us to support</li>
          <li>A bug, edge case, or unexpected calculation</li>
          <li>A feature request — we read every one</li>
        </ul>

        <p>
          Security disclosures should follow{" "}
          <a href="/.well-known/security.txt">our security.txt</a> instead.
        </p>
      </article>
    </main>
  );
}
