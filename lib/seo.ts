import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { type ModelPricing } from "@/lib/pricing";

// Re-exports kept for back-compat with callers still importing from here.
export const SITE_URL = siteConfig.url;
export const SITE_NAME = siteConfig.name;
export const SITE_DESCRIPTION = siteConfig.description;
export const SITE_CONTACT_EMAIL = siteConfig.supportEmail;

export interface BuildMetadataInput {
  title?: string;
  description?: string;
  /** Path relative to siteConfig.url, e.g. "/token-calculator/anthropic-claude-4-5-sonnet". */
  path?: string;
  /** Override the OG image URL. Defaults to /opengraph-image. */
  image?: string;
}

export function buildMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  image,
}: BuildMetadataInput = {}): Metadata {
  const url = new URL(path, siteConfig.url).toString();
  const fullTitle = title ?? `${siteConfig.name} — LLM Token & Cost Calculator`;
  const ogImage = image ?? new URL("/api/og", siteConfig.url).toString();

  // Only include `title` when caller passed one. Spreading `...buildMetadata()` from a
  // parent layout used to clobber the layout's `title.default` / `title.template` config
  // with `undefined`, breaking the page's <title> element entirely.
  const meta: Metadata = {
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: fullTitle,
      description,
      siteName: siteConfig.name,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
  if (title) meta.title = title;
  return meta;
}

// --- JSON-LD builders ------------------------------------------------------

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
  } as const;
}

export function webApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": siteConfig.jsonLd.type,
    name: `${siteConfig.name} — LLM Token & Cost Calculator`,
    url: siteConfig.url,
    applicationCategory: siteConfig.jsonLd.applicationCategory,
    operatingSystem: siteConfig.jsonLd.operatingSystem,
    description: siteConfig.description,
    offers: { "@type": "Offer", price: siteConfig.jsonLd.price, priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
  } as const;
}

/**
 * The editorial author entity — an Organization-typed desk, not a fabricated person. Google
 * accepts a team/brand as an author; embedding it on the money/pricing pages earns the
 * E-E-A-T "Who" signal without inventing a checkable credential. See the audit playbook §6.
 */
export function editorialAuthorJsonLd() {
  return {
    "@type": "Organization",
    name: siteConfig.author.name,
    url: new URL(siteConfig.author.methodologyPath, siteConfig.url).toString(),
  } as const;
}

export function softwareApplicationJsonLd(model: ModelPricing) {
  const url = new URL(`/token-calculator/${model.slug}`, siteConfig.url).toString();
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${model.label} token & cost calculator`,
    url,
    applicationCategory: siteConfig.jsonLd.applicationCategory,
    operatingSystem: siteConfig.jsonLd.operatingSystem,
    description: `Tokenize prompts and estimate API cost for ${model.label}. Runs entirely in your browser.`,
    offers: { "@type": "Offer", price: siteConfig.jsonLd.price, priceCurrency: "USD" },
    author: editorialAuthorJsonLd(),
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
  } as const;
}

/**
 * Questions that recur (with near-identical phrasing) across most model pages — privacy,
 * tokenizer accuracy, context window. They stay VISIBLE on every page (real user value), but
 * we drop them from the per-URL FAQPage JSON-LD so the structured-data body varies page to
 * page instead of carrying a repeated "scaled" fingerprint across the set. FAQ rich results
 * carry no upside for a non-gov/health site post-2023, so nothing is lost by trimming schema.
 */
const GENERIC_FAQ_QUESTIONS: ReadonlySet<string> = new Set([
  "Does my prompt leave the browser?",
  "Is the token count exact?",
  "What is the context window?",
  "How accurate is the token count?",
]);

/** The page-unique subset of FAQs to emit as FAQPage structured data (see above). */
export function distinctiveFaqs<T extends { q: string }>(faqs: ReadonlyArray<T>): T[] {
  return faqs.filter((f) => !GENERIC_FAQ_QUESTIONS.has(f.q.trim()));
}

export function faqPageJsonLd(faqs: ReadonlyArray<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  } as const;
}

export function breadcrumbListJsonLd(
  items: ReadonlyArray<{ name: string; path: string }>,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: new URL(item.path, siteConfig.url).toString(),
    })),
  };
}

/**
 * Renderable JSON-LD <script>. Prefer the <JsonLd> component (components/seo/JsonLd.tsx)
 * for new code; this helper exists for legacy callers and for SiteSchema.
 */
export function renderJsonLd(value: object): { __html: string } {
  return { __html: JSON.stringify(value) };
}
