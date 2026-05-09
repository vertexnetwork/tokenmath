import { Calculator } from '@/components/Calculator';
import { latestDataAsOf } from '@/lib/pricing';

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-(--container-app) flex-1 flex-col gap-10 px-6 py-10 sm:py-16">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          LLM Token & Cost Calculator
        </h1>
        <p className="max-w-2xl text-base text-(--text-muted) sm:text-lg">
          Paste a prompt. See the exact token count and API cost across Claude and Gemini. Runs
          entirely in your browser.
        </p>
      </header>

      <Calculator />

      <p className="text-xs text-(--text-muted)">
        Token counts are approximate (±2%) for Claude/Gemini current-gen models. Pricing reflects
        published rates as of {latestDataAsOf()}.
      </p>
    </main>
  );
}
