import type { MetadataRoute } from "next";
import { listModelSlugs } from "@/lib/pricing";
import { allPairSlugs } from "@/lib/compare";
import { listPlatformSlugs } from "@/lib/platforms";
import { siteConfig } from "@/lib/site-config";

// Use the latest commit author date so unchanged routes don't cache-bust on every build.
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
    { url: abs("/privacy"), lastModified: today, changeFrequency: "yearly", priority: 0.3 },
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

  const modelRoutes: MetadataRoute.Sitemap = listModelSlugs().map((slug) => ({
    url: abs(`/token-calculator/${slug}`),
    lastModified: today,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const compareRoutes: MetadataRoute.Sitemap = allPairSlugs().map((pair) => ({
    url: abs(`/compare/${pair}`),
    lastModified: today,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // Platform cost-panic pages — only enters the sitemap once entries are populated, so the
  // axis ships dark until its pricing data is verified.
  const platformSlugs = listPlatformSlugs();
  const platformIndex: MetadataRoute.Sitemap =
    platformSlugs.length > 0
      ? [{ url: abs("/cost"), lastModified: today, changeFrequency: "weekly", priority: 0.7 }]
      : [];
  const platformRoutes: MetadataRoute.Sitemap = platformSlugs.map((slug) => ({
    url: abs(`/cost/${slug}`),
    lastModified: today,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...modelRoutes, ...compareRoutes, ...platformIndex, ...platformRoutes];
}
