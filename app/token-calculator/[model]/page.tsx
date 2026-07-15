import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AdSlot } from "@/components/AdSlot";
import { Byline } from "@/components/Byline";
import { getModelBySlug, listModelSlugs, modelVerifiedDate, type ModelSlug } from "@/lib/pricing";
import { siteConfig } from "@/lib/site-config";
import {
  breadcrumbListJsonLd,
  buildMetadata,
  distinctiveFaqs,
  faqPageJsonLd,
  renderJsonLd,
  softwareApplicationJsonLd,
} from "@/lib/seo";
import type { Faq } from "@/components/FaqList";

interface ModelMdxModule {
  default: React.ComponentType;
  frontmatter?: {
    title?: string;
    description?: string;
    modelId?: string;
    faqs?: Faq[];
  };
}

export function generateStaticParams() {
  return listModelSlugs().map((model) => ({ model }));
}

export async function generateMetadata(props: {
  params: Promise<{ model: string }>;
}): Promise<Metadata> {
  const { model: slug } = await props.params;
  const model = getModelBySlug(slug);
  if (!model) return buildMetadata();
  // Intent-matched title/description. Live SERP recon (Jul 2026) on the "gpt 4.1 token cost
  // calculator" cluster showed every Page-1 incumbent leads with the tool noun
  // ("Calculator"/"Counter"); our prior price-led title dropped it, so calculator-seekers had
  // no lexical match to lock onto. Lead with the tool noun, keep the price hook, and surface the
  // true context window — several incumbents publish a stale/wrong value, so the correct number
  // is a factual trust signal that costs us nothing.
  const countNote = model.vendor === "openai" ? "exact token counts" : "token counts (±2–3%)";
  return buildMetadata({
    title: `${model.label} Token Cost Calculator — $${model.inputUsdPerM}/$${model.outputUsdPerM} per 1M`,
    description: `${model.label} token calculator: paste any prompt for ${countNote} and API cost. $${model.inputUsdPerM}/$${model.outputUsdPerM} per 1M tokens, ${model.contextWindow.toLocaleString("en-US")}-token context. Free, client-side, nothing uploaded.`,
    path: `/token-calculator/${model.slug}`,
    image: new URL(
      `/api/og?title=${encodeURIComponent(model.label)}&subtitle=${encodeURIComponent(`$${model.inputUsdPerM}/$${model.outputUsdPerM} per 1M tokens · token + cost calculator`)}`,
      siteConfig.url,
    ).toString(),
  });
}

async function loadContent(slug: ModelSlug): Promise<ModelMdxModule> {
  switch (slug) {
    case "anthropic-claude-4-5-sonnet":
      return import("@/content/models/anthropic-claude-4-5-sonnet.mdx");
    case "anthropic-claude-4-5-haiku":
      return import("@/content/models/anthropic-claude-4-5-haiku.mdx");
    case "anthropic-claude-4-7-opus":
      return import("@/content/models/anthropic-claude-4-7-opus.mdx");
    case "google-gemini-2-5-pro":
      return import("@/content/models/google-gemini-2-5-pro.mdx");
    case "google-gemini-2-5-flash":
      return import("@/content/models/google-gemini-2-5-flash.mdx");
    case "openai-gpt-5":
      return import("@/content/models/openai-gpt-5.mdx");
    case "openai-gpt-5-mini":
      return import("@/content/models/openai-gpt-5-mini.mdx");
    case "openai-gpt-5-nano":
      return import("@/content/models/openai-gpt-5-nano.mdx");
    case "openai-gpt-4-1":
      return import("@/content/models/openai-gpt-4-1.mdx");
    case "openai-gpt-4-1-mini":
      return import("@/content/models/openai-gpt-4-1-mini.mdx");
    case "openai-gpt-4o":
      return import("@/content/models/openai-gpt-4o.mdx");
    case "openai-gpt-4o-mini":
      return import("@/content/models/openai-gpt-4o-mini.mdx");
    case "anthropic-claude-4-8-opus":
      return import("@/content/models/anthropic-claude-4-8-opus.mdx");
    case "anthropic-claude-5-sonnet":
      return import("@/content/models/anthropic-claude-5-sonnet.mdx");
    case "google-gemini-3-1-pro":
      return import("@/content/models/google-gemini-3-1-pro.mdx");
    case "openai-gpt-5-5":
      return import("@/content/models/openai-gpt-5-5.mdx");
  }
}

export default async function ModelPage(props: { params: Promise<{ model: string }> }) {
  const { model: slug } = await props.params;
  const model = getModelBySlug(slug);
  if (!model) notFound();

  const Mod = await loadContent(model.slug);
  const Body = Mod.default;
  const faqs = Mod.frontmatter?.faqs ?? [];
  // Emit only the page-unique FAQs as structured data — the recurring privacy/accuracy ones
  // stay visible in the body but are kept out of the per-URL FAQPage to avoid a "scaled"
  // fingerprint across the model set.
  const schemaFaqs = distinctiveFaqs(faqs);

  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto flex w-full max-w-(--container-app) flex-1 flex-col gap-6 px-6 py-10 sm:py-16"
    >
      <nav aria-label="Breadcrumb" className="text-xs text-(--text-muted)">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-(--text)">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/models" className="hover:text-(--text)">
              Models
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-(--text)" aria-current="page">
            {model.label}
          </li>
        </ol>
      </nav>

      <Byline verified={modelVerifiedDate(model)} />

      <article className="prose prose-invert max-w-none prose-headings:tracking-tight prose-h1:text-3xl prose-h1:font-semibold prose-h2:mt-12 prose-h2:text-2xl prose-h2:font-semibold prose-a:text-(--accent) prose-a:no-underline prose-strong:text-(--text)">
        <Body />
      </article>

      <AdSlot placement="pseo-after-faq" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(softwareApplicationJsonLd(model))}
      />
      {schemaFaqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={renderJsonLd(faqPageJsonLd(schemaFaqs))}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(
          breadcrumbListJsonLd([
            { name: "Home", path: "/" },
            { name: "Models", path: "/models" },
            { name: model.label, path: `/token-calculator/${model.slug}` },
          ]),
        )}
      />
    </main>
  );
}
