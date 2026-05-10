import { Calculator } from '@/components/Calculator';
import { AdSlot } from '@/components/AdSlot';
import { APPROX_RANGE, latestDataAsOf } from '@/lib/pricing';
import { renderJsonLd, webApplicationJsonLd } from '@/lib/seo';

export default function HomePage() {
  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto flex w-full max-w-(--container-app) flex-1 flex-col gap-10 px-6 py-10 sm:py-16"
    >
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          LLM Token & Cost Calculator
        </h1>
        <p className="max-w-2xl text-base text-(--text-muted) sm:text-lg">
          Paste a prompt. See the token count and API cost across Claude, Gemini, and OpenAI. Runs
          entirely in your browser.
        </p>
      </header>

      <Calculator />

      <AdSlot placement="home-below-result" />

      <p className="text-xs text-(--text-muted)">
        OpenAI counts are exact; Claude and Gemini are approximate ({APPROX_RANGE}) — neither vendor
        publishes a current client tokenizer. Pricing reflects published rates as of{' '}
        {latestDataAsOf()}.
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(webApplicationJsonLd())}
      />
    </main>
  );
}
