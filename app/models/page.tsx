import type { Metadata } from "next";
import { ModelsBrowser } from "@/components/ModelsBrowser";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "All models",
  description:
    "Every model tokenmath supports — Claude, Gemini, and OpenAI — with current pricing. Filter by vendor, sort by cost or context window, or select two or more to compare side-by-side.",
  path: "/models",
});

export default function ModelsPage() {
  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto flex w-full max-w-(--container-app) flex-1 flex-col gap-10 px-6 py-10 sm:py-16"
    >
      <header className="flex flex-col gap-3">
        <p className="text-eyebrow text-(--accent)">Models</p>
        <h1 className="text-display-lg">Every model, with current pricing.</h1>
        <p className="max-w-2xl text-base text-(--text-muted) sm:text-lg">
          Filter by vendor or sort by cost. Tick the <span className="text-(--text)">Compare</span>{" "}
          box on two or more cards to see them side-by-side. Click any card to jump into the
          per-model calculator.
        </p>
      </header>

      <ModelsBrowser />
    </main>
  );
}
