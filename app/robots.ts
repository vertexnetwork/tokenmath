import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

const AI_BOTS = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'PerplexityBot', 'CCBot'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      // Per §7.3 — explicit allow so AI engines that respect their own bot tokens cite us.
      ...AI_BOTS.map((bot) => ({ userAgent: bot, allow: '/' })),
    ],
    sitemap: new URL('/sitemap.xml', SITE_URL).toString(),
    host: SITE_URL,
  };
}
