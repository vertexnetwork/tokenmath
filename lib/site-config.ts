/**
 * The keystone — every brand string, theme color, nav link, and feature flag funnels through
 * this object. Per the Vertex Network spec §4: a hardcoded `name`, `domain`, `email`, social
 * handle, disclaimer, or nav link in any other file is a P0 audit failure.
 *
 * Required identity fields fall back to project defaults when env vars are absent so local
 * dev still works, but `NEXT_PUBLIC_SITE_*` should be set in Vercel for every environment.
 */

export type AdProvider = "none" | "adsense" | "mediavine" | "carbon";

export const siteConfig = {
  // identity
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "tokenmath",
  shortName: process.env.NEXT_PUBLIC_SITE_SHORT_NAME ?? "tokenmath",
  domain: process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "tokenmath.dev",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://tokenmath.dev",
  tagline: "Token math for Claude, Gemini, and GPT.",
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ??
    "Accurate token math for Claude, Gemini, and OpenAI. 100% client-side.",
  keywords: [
    "token counter",
    "llm pricing",
    "claude pricing",
    "gemini pricing",
    "gpt pricing",
    "openai cost calculator",
    "tokenizer",
  ],

  // contact / legal
  supportEmail: process.env.NEXT_PUBLIC_SITE_CONTACT_EMAIL ?? "hello@tokenmath.dev",

  // editorial identity — the named desk behind the pricing research. Deliberately an
  // org/team entity, NOT a fabricated person: Google accepts an editorial author, and we
  // only assert what's verifiable (the sourcing + re-verification discipline). No invented
  // degrees, employers, or press — see the pSEO audit playbook, Part 6 ("anonymity yes,
  // fabrication no"). Drives the visible byline + the JSON-LD author/publisher.
  author: {
    name: "tokenmath Research Desk",
    /** Byline target — the "how we verify" methodology section on /about. */
    methodologyPath: "/about#methodology",
  },

  // theme tokens (the JS surface; CSS source-of-truth still lives in app/globals.css)
  theme: {
    colors: {
      bg: "#0A0A0B",
      surface: "#131418",
      accent: "#B4A0F5",
      onBg: "#E7E7EA",
      onAccent: "#0A0A0B",
      muted: "#9C9CA3",
    },
    fontDisplay: "Inter",
    fontBody: "Inter",
    radiusCard: "0.75rem",
  },

  // brand mark — drives app/icon.tsx, app/apple-icon.tsx, public/icon.svg, /api/og
  brand: {
    markColor: "#B4A0F5",
    markBgColor: "#0A0A0B",
  },

  // navigation
  nav: {
    primary: [
      { href: "/#calculator", label: "Calculator" },
      { href: "/models", label: "Models" },
      { href: "/compare", label: "Compare" },
      { href: "/pricing-data", label: "Pricing" },
      { href: "/about", label: "About" },
    ],
    footer: {
      product: [
        { href: "/#calculator", label: "Calculator" },
        { href: "/models", label: "Models" },
        { href: "/compare", label: "Compare models" },
        { href: "/cost", label: "Platform costs" },
        { href: "/pricing-data", label: "Pricing data" },
      ],
      company: [
        { href: "/about", label: "About" },
        { href: "/changelog", label: "Changelog" },
        { href: "/network", label: "Vertex Network" },
        {
          href: "https://github.com/vertexnetwork/tokenmath",
          label: "Source ↗",
          external: true,
        },
      ],
      legal: [
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms" },
        { href: "/contact", label: "Contact" },
      ],
    },
  },

  // JSON-LD
  jsonLd: {
    type: "WebApplication",
    operatingSystem: "Any (browser)",
    applicationCategory: "DeveloperApplication",
    price: 0,
  },

  // GitHub — used by various scripts; not surfaced on /changelog (titles-only by design)
  repoUrl: "https://github.com/vertexnetwork/tokenmath",

  // feature flags
  features: {
    embed: { enabled: false, route: "/embed/widget", params: [] as string[] },
    extension: { enabled: false, chromeWebStoreUrl: "" },
    proEnabled: false,
    email: {
      // Ships dark: the form + /api/subscribe render no-ops until NEXT_PUBLIC_EMAIL_ENABLED=1
      // (client) and RESEND_API_KEY + RESEND_AUDIENCE_ID (server) are set.
      enabled: process.env.NEXT_PUBLIC_EMAIL_ENABLED === "1",
      leadMagnetName: "LLM price-change alerts",
    },
    ads: {
      provider: (process.env.NEXT_PUBLIC_AD_PROVIDER as AdProvider | undefined) ?? "none",
    },
    affiliate: {
      enabled: !!process.env.NEXT_PUBLIC_AFFILIATE_URL,
      url: process.env.NEXT_PUBLIC_AFFILIATE_URL ?? "",
      label: process.env.NEXT_PUBLIC_AFFILIATE_LABEL ?? "",
      provider: process.env.NEXT_PUBLIC_AFFILIATE_PROVIDER ?? "",
    },
    consent: { required: true },
    themeToggle: true,
  },

  // monetization
  monetization: {
    stripe: { priceIds: { monthly: "", yearly: "" } },
    lemonSqueezy: { storeId: "", productSlug: "" },
    gumroad: { productUrl: "", price: 0 },
  },

  // SEO verification — env-driven so tokens never land in repo
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
  },

  // RFC 9116 — drives public/.well-known/security.txt
  security: {
    contact: "mailto:security@tokenmath.dev",
    expires: "2027-01-01T00:00:00Z",
  },
} as const;

export type SiteConfig = typeof siteConfig;
