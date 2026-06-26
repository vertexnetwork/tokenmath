import type { MetadataRoute } from "next";
import { MODELS, modelVerifiedDate, PRIVACY_UPDATED } from "@/lib/pricing";
import { allPairs } from "@/lib/compare";
import { PLATFORMS, platformVerifiedDate } from "@/lib/platforms";
import { siteConfig } from "@/lib/site-config";

// Generated routes carry their real per-page "verified" date (below); this build-date is the
// fallback only for genuinely build-frequency static routes (home, hubs, changelog), so the
// sitemap no longer claims every URL changed on the same day each deploy.
// Vercel sets VERCEL_GIT_COMMIT_AUTHOR_DATE; locally fall back to "now".
function lastmod(): Date {
  const commitDate = process.env.VERCEL_GIT_COMMIT_AUTHOR_DATE;
  if (commitDate) {
    const parsed = new Date(commitDate);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const today = lastmod();
  const abs = (path: string) => new URL(path, siteConfig.url).toString();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, lastModified: today, changeFrequency: "weekly", priority: 1 },
    { url: abs("/models"), lastModified: today, changeFrequency: "weekly", priority: 0.7 },
    { url: abs("/compare"), lastModified: today, changeFrequency: "weekly", priority: 0.7 },
    { url: abs("/about"), lastModified: today, changeFrequency: "monthly", priority: 0.5 },
    { url: abs("/contact"), lastModified: today, changeFrequency: "yearly", priority: 0.3 },
    {
      url: abs("/privacy"),
      lastModified: new Date(PRIVACY_UPDATED),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    { url: abs("/terms"), lastModified: today, changeFrequency: "yearly", priority: 0.3 },
    { url: abs("/network"), lastModified: today, changeFrequency: "monthly", priority: 0.5 },
    {
      url: abs("/pricing-data"),
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    { url: abs("/changelog"), lastModified: today, changeFrequency: "weekly", priority: 0.5 },
  ];

  const modelRoutes: MetadataRoute.Sitemap = MODELS.map((m) => ({
    url: abs(`/token-calculator/${m.slug}`),
    lastModified: new Date(modelVerifiedDate(m)),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Each pair's lastmod is the newer of its two models' verify dates (ISO sorts lexically).
  const compareRoutes: MetadataRoute.Sitemap = allPairs().map(({ slug, a, b }) => ({
    url: abs(`/compare/${slug}`),
    lastModified: new Date([modelVerifiedDate(a), modelVerifiedDate(b)].sort().at(-1)!),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // Platform cost-panic pages — only enters the sitemap once entries are populated, so the
  // axis ships dark until its pricing data is verified.
  const platformIndex: MetadataRoute.Sitemap =
    PLATFORMS.length > 0
      ? [{ url: abs("/cost"), lastModified: today, changeFrequency: "weekly", priority: 0.7 }]
      : [];
  const platformRoutes: MetadataRoute.Sitemap = PLATFORMS.map((p) => ({
    url: abs(`/cost/${p.slug}`),
    lastModified: new Date(platformVerifiedDate(p)),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...modelRoutes, ...compareRoutes, ...platformIndex, ...platformRoutes];
}
