import type { Metadata } from 'next';
import { type ModelPricing } from '@/lib/pricing';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tokenmath.dev';
export const SITE_NAME = 'tokenmath';
export const SITE_DESCRIPTION =
  'Accurate token math for Claude, Gemini, and OpenAI. 100% client-side.';
export const SITE_CONTACT_EMAIL = 'hello@tokenmath.dev';

// Vertex sister sites — rendered in the Organization JSON-LD sameAs list. These are partner
// sites in the same network, not social profiles.
const VERTEX_SAME_AS = [
  'https://shopifont.app',
  'https://etsymargin.tools',
  'https://captionsnap.io',
  'https://kdpcover.pro',
];

export interface BuildMetadataInput {
  title?: string;
  description?: string;
  /** Path relative to SITE_URL, e.g. "/token-calculator/anthropic-claude-4-5-sonnet". */
  path?: string;
  /** Override the OG image URL. Defaults to /opengraph-image. */
  image?: string;
}

export function buildMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = '/',
  image,
}: BuildMetadataInput = {}): Metadata {
  const url = new URL(path, SITE_URL).toString();
  const fullTitle = title ?? `${SITE_NAME} — LLM Token & Cost Calculator`;
  const ogImage = image ?? new URL('/api/og', SITE_URL).toString();

  return {
    title: title ? title : undefined,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      url,
      title: fullTitle,
      description,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
  };
}

// --- JSON-LD builders ------------------------------------------------------

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    sameAs: VERTEX_SAME_AS,
  } as const;
}

export function webApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${SITE_NAME} — LLM Token & Cost Calculator`,
    url: SITE_URL,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any (browser)',
    description: SITE_DESCRIPTION,
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  } as const;
}

export function softwareApplicationJsonLd(model: ModelPricing) {
  const url = new URL(`/token-calculator/${model.slug}`, SITE_URL).toString();
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${model.label} token & cost calculator`,
    url,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any (browser)',
    description: `Tokenize prompts and estimate API cost for ${model.label}. Runs entirely in your browser.`,
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
  } as const;
}

export function faqPageJsonLd(faqs: ReadonlyArray<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  } as const;
}

export function breadcrumbListJsonLd(
  items: ReadonlyArray<{ name: string; path: string }>,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: new URL(item.path, SITE_URL).toString(),
    })),
  };
}

/**
 * Renderable JSON-LD <script>. Use:
 *   <script type="application/ld+json" dangerouslySetInnerHTML={renderJsonLd(obj)} />
 */
export function renderJsonLd(value: object): { __html: string } {
  return { __html: JSON.stringify(value) };
}
