import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { PRIVACY_UPDATED } from '@/lib/pricing';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy',
  description:
    'How tokenmath handles your data: client-side tokenization, masked analytics, no prompt content ever transmitted off your browser.',
  path: '/privacy',
});

export default function PrivacyPage() {
  const updated = PRIVACY_UPDATED;
  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10 sm:py-16"
    >
      <article className="prose prose-invert max-w-none prose-headings:tracking-tight prose-a:text-(--accent) prose-a:no-underline">
        <h1>Privacy</h1>
        <p className="text-sm text-(--text-muted)">Last updated: {updated}</p>

        <h2>What we collect</h2>

        <p>
          <strong>We do not collect, log, or transmit your prompt content.</strong> Tokenization
          runs entirely in JavaScript on your browser — for inputs longer than 50,000 characters, in
          a Web Worker on your browser. There is no server endpoint on this site that receives
          prompt text.
        </p>

        <p>
          The only serverless function on the site is <code>/api/og</code>, used to render social
          preview images. It accepts two short query strings (a title and a subtitle) that are
          rendered into the preview image; it does not accept or process prompt text.
        </p>

        <h2>Analytics</h2>

        <ul>
          <li>
            <strong>Vercel Web Analytics</strong> records page views and a small set of custom
            events (e.g. when the calculator runs, with the chosen model and a token-count bucket
            like <code>&lt;1k</code> or <code>10k-100k</code>). Event payloads never include prompt
            content.
          </li>
          <li>
            <strong>Microsoft Clarity</strong> may record anonymized session replays. The prompt
            textarea and the cost totals on the result card are tagged for masking, and the
            project&apos;s Clarity dashboard is set to &ldquo;Mask all text.&rdquo; Recordings show
            the structure of how the page is used (clicks, scroll, viewport size) but obscure the
            prompt content and cost amounts. You can opt out by enabling Do Not Track in your
            browser or by blocking <code>*.clarity.ms</code>.
          </li>
        </ul>

        <h2>Cookies</h2>

        <p>
          The site itself sets no cookies. Vercel Analytics and Microsoft Clarity may set
          first-party cookies for session correlation. If we later enable advertising (currently
          disabled), the ad provider may set additional cookies; we will update this page when that
          happens.
        </p>

        <h2>Third parties</h2>

        <ul>
          <li>
            <strong>Vercel</strong> hosts the site and serves all assets.
          </li>
          <li>
            <strong>Microsoft Clarity</strong> provides anonymized session replay.
          </li>
          <li>
            <strong>Ad providers</strong> (Google AdSense or MediaVine) — currently disabled. When
            enabled, see the provider&apos;s privacy policy for details on how their ad
            personalization works.
          </li>
        </ul>

        <h2>Data retention</h2>

        <p>
          Because we do not collect prompt content, there is nothing to retain. Aggregate analytics
          retention is governed by the third-party providers&apos; defaults (Vercel: 12 months;
          Clarity: 13 months at time of writing).
        </p>

        <h2>Contact</h2>

        <p>
          For privacy questions, email <a href="mailto:hello@tokenmath.dev">hello@tokenmath.dev</a>.
        </p>
      </article>
    </main>
  );
}
