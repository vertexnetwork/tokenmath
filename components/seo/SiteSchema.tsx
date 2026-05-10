import { siteConfig } from "@/lib/site-config";
import { listAll } from "@/lib/network";
import { JsonLd } from "./JsonLd";

/**
 * Mounted once in app/layout.tsx. Emits the WebSite + Organization pair every page
 * needs for canonical SEO. The Organization sameAs list is sourced from
 * public/network.json (HUB) so adding a sister site to the hub fans out automatically.
 */
export function SiteSchema() {
  const sameAs = listAll()
    .filter((s) => s.url.replace(/\/+$/, "") !== siteConfig.url.replace(/\/+$/, ""))
    .map((s) => s.url);

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  } as const;

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    sameAs,
  } as const;

  return (
    <>
      <JsonLd data={website} />
      <JsonLd data={organization} />
    </>
  );
}
