import Link from "next/link";
import { Calculator } from "@/components/Calculator";
import { AdSlot } from "@/components/AdSlot";
import { APPROX_RANGE, latestDataAsOf, MODELS } from "@/lib/pricing";
import { renderJsonLd, webApplicationJsonLd } from "@/lib/seo";

export default function HomePage() {
  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto flex w-full max-w-(--container-app) flex-1 flex-col gap-10 px-6 pb-24 pt-10 sm:pb-32 sm:pt-16"
    >
      <header className="flex flex-col gap-4">
        <p className="text-eyebrow text-(--accent)">Calculator</p>
        <h1 className="text-display-lg max-w-3xl">
          Token math for <span className="font-serif italic">Claude</span>,{" "}
          <span className="font-serif italic">Gemini</span>, and{" "}
          <span className="font-serif italic">GPT</span>.
        </h1>
        <p className="max-w-2xl text-base text-(--text-muted) sm:text-lg">
          Paste a prompt. See the exact token count and API cost across every current model.
          Tokenization runs in your browser; nothing about your prompt leaves the page.
        </p>
      </header>

      <Calculator />

      <AdSlot placement="home-below-result" />

      <p className="text-xs text-(--text-faint)">
        OpenAI counts are exact; Claude and Gemini are approximate ({APPROX_RANGE}) — neither vendor
        publishes a current client tokenizer. Pricing reflects published rates as of{" "}
        {latestDataAsOf()}.
      </p>

      <nav
        aria-label="Per-model calculators"
        className="flex flex-col gap-3 border-t border-(--border) pt-8"
      >
        <h2 className="text-eyebrow text-(--text-muted)">Per-model token &amp; cost calculators</h2>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {MODELS.map((m) => (
            <li key={m.slug}>
              <Link
                href={`/token-calculator/${m.slug}`}
                className="text-(--text-muted) hover:text-(--accent)"
              >
                {m.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(webApplicationJsonLd())}
      />
    </main>
  );
}
