import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'About tokencount',
  description: 'Why tokencount exists, how it works, and what we promise about your data.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10 sm:py-16">
      <article className="prose prose-invert max-w-none prose-headings:tracking-tight prose-a:text-(--accent) prose-a:no-underline">
        <h1>About tokencount</h1>

        <p>
          <strong>tokencount</strong> is a calculator for two questions every team building with
          Anthropic Claude or Google Gemini ends up asking: how many tokens is this prompt, and what
          is it going to cost? It exists because answering those questions shouldn&apos;t require
          pasting your prompt into someone else&apos;s server.
        </p>

        <h2>How it works</h2>

        <p>
          When you paste text into the calculator, the page tokenizes it locally — in JavaScript, on
          your browser, using the same kind of byte-pair encoders the model vendors use. For inputs
          longer than 50,000 characters, the work moves to a Web Worker so the page stays
          responsive. The number you see is computed on your machine and multiplied by the
          per-million pricing the vendor publishes.
        </p>

        <p>
          We treat tokenizers as approximations. Anthropic and Google don&apos;t ship official
          client-side tokenizers for their current generation models, so we use the closest public
          encodings — <code>cl100k_base</code> for Claude, <code>o200k_base</code> for Gemini — and
          apply per-model calibration to nudge the result toward the vendor counts. In practice the
          drift is well under 5% on typical English and code; treat the number as a budgeting
          estimate, not a billing reconciliation.
        </p>

        <h2>What we promise</h2>

        <ul>
          <li>
            <strong>Your prompt never leaves your browser.</strong> There is no server endpoint that
            ever receives prompt text. The only serverless function on this site is
            <code>/api/og</code> — used to render social preview images — and it only accepts two
            short query strings used in the OG card itself.
          </li>
          <li>
            <strong>Analytics are aggregate.</strong> We use Vercel Web Analytics for page-level
            metrics and Microsoft Clarity for session replay; both are configured to mask the prompt
            textarea and cost totals. See the <a href="/privacy">privacy policy</a> for specifics.
          </li>
          <li>
            <strong>Pricing data is dated.</strong> Every model carries a <code>dataAsOf</code>{' '}
            stamp showing when we last verified its rate against the vendor&apos;s public pricing
            page. See <a href="/pricing-data">pricing data</a> for the current table.
          </li>
        </ul>

        <h2>Built by</h2>

        <p>
          tokencount is part of the{' '}
          <a href="https://shopifont.app" target="_blank" rel="noopener">
            Vertex Network
          </a>{' '}
          — a small set of developer + creator tools sharing a common stack and design language.
        </p>
      </article>
    </main>
  );
}
