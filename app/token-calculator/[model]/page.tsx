import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AdSlot } from "@/components/AdSlot";
import { getModelBySlug, listModelSlugs, type ModelSlug } from "@/lib/pricing";
import { siteConfig } from "@/lib/site-config";
import {
  breadcrumbListJsonLd,
  buildMetadata,
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
  return buildMetadata({
    title: `${model.label} token & cost calculator`,
    description: `Tokenize prompts and estimate API cost for ${model.label}. Runs entirely in your browser. Pricing as of ${model.dataAsOf}.`,
    path: `/token-calculator/${model.slug}`,
    image: new URL(
      `/api/og?title=${encodeURIComponent(model.label)}&subtitle=${encodeURIComponent("Token + cost calculator. Privately, in your browser.")}`,
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
  }
}

export default async function ModelPage(props: { params: Promise<{ model: string }> }) {
  const { model: slug } = await props.params;
  const model = getModelBySlug(slug);
  if (!model) notFound();

  const Mod = await loadContent(model.slug);
  const Body = Mod.default;
  const faqs = Mod.frontmatter?.faqs ?? [];

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

      <article className="prose prose-invert max-w-none prose-headings:tracking-tight prose-h1:text-3xl prose-h1:font-semibold prose-h2:mt-12 prose-h2:text-2xl prose-h2:font-semibold prose-a:text-(--accent) prose-a:no-underline prose-strong:text-(--text)">
        <Body />
      </article>

      <AdSlot placement="pseo-after-faq" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(softwareApplicationJsonLd(model))}
      />
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={renderJsonLd(faqPageJsonLd(faqs))}
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
