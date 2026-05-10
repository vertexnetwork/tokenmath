import type { MetadataRoute } from 'next';
import { listModelSlugs } from '@/lib/pricing';
import { SITE_URL } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: today, changeFrequency: 'weekly', priority: 1 },
    {
      url: new URL('/models', SITE_URL).toString(),
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: new URL('/about', SITE_URL).toString(),
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: new URL('/privacy', SITE_URL).toString(),
      lastModified: today,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: new URL('/pricing-data', SITE_URL).toString(),
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: new URL('/changelog', SITE_URL).toString(),
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  const modelRoutes: MetadataRoute.Sitemap = listModelSlugs().map((slug) => ({
    url: new URL(`/token-calculator/${slug}`, SITE_URL).toString(),
    lastModified: today,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...modelRoutes];
}
