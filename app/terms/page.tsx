import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = buildMetadata({
  title: "Terms",
  description: `Terms of use for ${siteConfig.name}. A small, opinionated tool, offered as-is.`,
  path: "/terms",
});

const UPDATED = "2026-05-10";

export default function TermsPage() {
  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10 sm:py-16"
    >
      <header className="flex flex-col gap-3">
        <p className="text-eyebrow text-(--accent)">Terms</p>
        <h1 className="text-display-lg">Terms of use.</h1>
        <p className="text-sm text-(--text-faint)">Last updated: {UPDATED}</p>
      </header>

      <article className="prose max-w-none prose-headings:tracking-tight">
        <h2>What this site is</h2>
        <p>
          {siteConfig.name} is a free calculator for estimating LLM token counts and API costs. It
          runs entirely in your browser. By using the site you agree to these terms.
        </p>

        <h2>What we promise</h2>
        <ul>
          <li>
            <strong>Your prompt content stays in your browser.</strong> See the{" "}
            <Link href="/privacy">privacy policy</Link> for the full list of what is and isn&apos;t
            collected.
          </li>
          <li>
            <strong>Pricing is dated.</strong> Every model carries a verification date and a link to
            the vendor&apos;s pricing page on <Link href="/pricing-data">/pricing-data</Link>. We
            refresh weekly.
          </li>
          <li>
            <strong>The tool is free to use</strong> for personal and commercial purposes, including
            embedding screenshots in slides, blog posts, and reports.
          </li>
        </ul>

        <h2>What we don&apos;t promise</h2>
        <ul>
          <li>
            <strong>Estimates are estimates.</strong> OpenAI counts are exact (canonical client
            tokenizer); Claude and Gemini are approximated against vendors who don&apos;t publish
            current client tokenizers. Drift is typically under a few percent on English and code,
            but treat the numbers as budgeting estimates, not billing reconciliations.
          </li>
          <li>
            <strong>Pricing may be stale.</strong> We aim for same-day updates when we notice a
            vendor change, but vendor pricing pages can move without notice. Always confirm with the
            vendor before committing to a contract.
          </li>
          <li>
            <strong>The site is offered as-is.</strong> No warranty, express or implied, including
            merchantability or fitness for a particular purpose.
          </li>
        </ul>

        <h2>Acceptable use</h2>
        <p>
          Don&apos;t try to attack, scrape at scale, or otherwise interfere with the site or other
          users. Don&apos;t reverse-engineer our analytics. Don&apos;t impersonate {siteConfig.name}{" "}
          or claim the calculator is operated by a vendor it isn&apos;t — this is an independent
          tool, not affiliated with Anthropic, Google, or OpenAI.
        </p>

        <h2>Affiliate disclosure</h2>
        <p>
          Some pages may include affiliate links to third-party services that pay us a referral fee
          at no cost to you. The link is always labeled and clearly distinct from primary content.
          We only link to services we&apos;ve used or evaluated; we never accept payment for
          placement.
        </p>

        <h2>Changes</h2>
        <p>
          We may update these terms from time to time. The &ldquo;Last updated&rdquo; date at the
          top of this page reflects the most recent change. Continued use of the site after a change
          constitutes acceptance of the new terms.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms? Email{" "}
          <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
        </p>
      </article>
    </main>
  );
}
