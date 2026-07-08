import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import createMDX from "@next/mdx";
import { buildCSP } from "./lib/csp";
import { siteConfig } from "./lib/site-config";

const here = dirname(fileURLToPath(import.meta.url));

// Plugins are passed by name (strings) so Turbopack can serialize the loader options.
// Importing the plugin functions directly works with Webpack but breaks Turbopack builds.
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [
      "remark-frontmatter",
      ["remark-mdx-frontmatter", { name: "frontmatter" }],
      "remark-gfm",
    ],
    rehypePlugins: ["rehype-slug", ["rehype-autolink-headings", { behavior: "wrap" }]],
  },
});

// Provider-aware CSP (lib/csp.ts) so spokes don't ship the union allowlist when not needed.
const ads = siteConfig.features.ads.provider;
const CSP = buildCSP({
  vercelAnalytics: true,
  clarity: !!process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,
  plausible: !!process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
  adsense: ads === "adsense",
  mediavine: ads === "mediavine",
  carbon: ads === "carbon",
  embed: false,
});

const SECURITY_HEADERS = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  turbopack: {
    root: here,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
      // Non-content generated routes (OG/social image endpoint, PWA/app icons). Google was
      // crawling these and filing them under "Crawled — currently not indexed", which is noise:
      // they're images, not pages, and were never meant to rank. X-Robots-Tag: noindex tells
      // Google to drop them explicitly. Social/OG scrapers ignore this tag when rendering a
      // card, so link previews are unaffected.
      ...["/api/og", "/icon", "/apple-icon", "/opengraph-image", "/twitter-image"].map(
        (source) => ({
          source,
          headers: [{ key: "X-Robots-Tag", value: "noindex" }],
        }),
      ),
    ];
  },
  // www → apex redirect is handled at the Vercel platform level (Project Settings →
  // Domains → set apex as primary and configure www as a redirect). Doing it in both
  // places caused ERR_TOO_MANY_REDIRECTS on first deploy.
};

export default withMDX(nextConfig);
