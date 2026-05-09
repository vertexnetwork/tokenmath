import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getModelBySlug, listModelSlugs, type ModelSlug } from '@/lib/pricing';
import { buildMetadata } from '@/lib/seo';

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
      `/api/og?title=${encodeURIComponent(model.label)}&subtitle=${encodeURIComponent('Token + cost calculator. Privately, in your browser.')}`,
      process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tokencount.ai',
    ).toString(),
  });
}

async function loadContent(slug: ModelSlug) {
  switch (slug) {
    case 'anthropic-claude-4-5-sonnet':
      return import('@/content/models/anthropic-claude-4-5-sonnet.mdx');
    case 'anthropic-claude-4-5-haiku':
      return import('@/content/models/anthropic-claude-4-5-haiku.mdx');
    case 'anthropic-claude-4-7-opus':
      return import('@/content/models/anthropic-claude-4-7-opus.mdx');
    case 'google-gemini-2-5-pro':
      return import('@/content/models/google-gemini-2-5-pro.mdx');
    case 'google-gemini-2-5-flash':
      return import('@/content/models/google-gemini-2-5-flash.mdx');
  }
}

export default async function ModelPage(props: { params: Promise<{ model: string }> }) {
  const { model: slug } = await props.params;
  const model = getModelBySlug(slug);
  if (!model) notFound();

  const Mod = await loadContent(model.slug);
  const Body = Mod.default;

  return (
    <main className="mx-auto flex w-full max-w-(--container-app) flex-1 flex-col gap-6 px-6 py-10 sm:py-16">
      <article className="prose prose-invert max-w-none prose-headings:tracking-tight prose-h1:text-3xl prose-h1:font-semibold prose-h2:mt-12 prose-h2:text-2xl prose-h2:font-semibold prose-a:text-(--accent) prose-a:no-underline prose-strong:text-(--text)">
        <Body />
      </article>
    </main>
  );
}
