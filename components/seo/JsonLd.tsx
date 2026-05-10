import { renderJsonLd } from "@/lib/seo";

/**
 * Generic JSON-LD emitter. Use this instead of inlining the <script> + dangerouslySetInnerHTML
 * pattern at every call site so we have one place to add validation, dedup, or batching later.
 */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={renderJsonLd(data)} />;
}
