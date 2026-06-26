import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { AdSlot } from "@/components/AdSlot";
import { Byline } from "@/components/Byline";
import { siteConfig } from "@/lib/site-config";
import { APPROX_DRIFT, modelVerifiedDate } from "@/lib/pricing";
import {
  allPairSlugs,
  computeFacts,
  EXAMPLE_INPUT_TOKENS,
  EXAMPLE_OUTPUT_TOKENS,
  formatPerM,
  getPairBySlug,
  pairAngle,
} from "@/lib/compare";
import { breadcrumbListJsonLd, buildMetadata, faqPageJsonLd, renderJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return allPairSlugs().map((pair) => ({ pair }));
}

export async function generateMetadata(props: {
  params: Promise<{ pair: string }>;
}): Promise<Metadata> {
  const { pair } = await props.params;
  const resolved = getPairBySlug(pair);
  if (!resolved) return buildMetadata();
  const { a, b } = resolved;
  return buildMetadata({
    title: `${a.label} vs ${b.label}: pricing & cost compared`,
    description: `${a.label} is ${formatPerM(a.inputUsdPerM)}/${formatPerM(a.outputUsdPerM)} per 1M tokens; ${b.label} is ${formatPerM(b.inputUsdPerM)}/${formatPerM(b.outputUsdPerM)}. Compare token cost, context window, and accuracy side by side — free, in your browser.`,
    path: `/compare/${resolved.canonical}`,
    image: new URL(
      `/api/og?title=${encodeURIComponent(`${a.label} vs ${b.label}`)}&subtitle=${encodeURIComponent("Token cost comparison")}`,
      siteConfig.url,
    ).toString(),
  });
}

function fmtUsd(n: number): string {
  if (n === 0) return "$0";
  // 4 dp covers sub-cent per-request totals; trim trailing zeros so $0.0200 reads "$0.02".
  return `$${n.toFixed(4).replace(/0+$/, "").replace(/\.$/, "")}`;
}

export default async function ComparePage(props: { params: Promise<{ pair: string }> }) {
  const { pair } = await props.params;
  const resolved = getPairBySlug(pair);
  if (!resolved) notFound();
  // Collapse the reverse ordering (b-vs-a) onto the single canonical URL so we never split
  // ranking equity or serve duplicate content.
  if (!resolved.isCanonical) permanentRedirect(`/compare/${resolved.canonical}`);

  const { a, b } = resolved;
  const f = computeFacts(a, b);
  const angle = pairAngle(a, b, f);
  // Newer of the two verify dates — the honest "as of" for the pair (ISO sorts lexically).
  const verified = [modelVerifiedDate(a), modelVerifiedDate(b)].sort().at(-1)!;
  const exampleLabel = `${EXAMPLE_INPUT_TOKENS.toLocaleString("en-US")} input + ${EXAMPLE_OUTPUT_TOKENS.toLocaleString("en-US")} output tokens`;
  // Scale the per-request delta to something tangible.
  const per100k = Math.abs(f.example.aTotal - f.example.bTotal) * 100_000;

  const faqs = [
    {
      q: `Is ${a.label} or ${b.label} cheaper?`,
      a: f.example.cheaper
        ? `For a typical request (${exampleLabel}), ${f.example.cheaper.label} is cheaper — about ${f.example.savingPctPer1kRequests}% less, or roughly ${fmtUsd(per100k)} saved per 100,000 requests. ${a.label} runs ${formatPerM(a.inputUsdPerM)}/${formatPerM(a.outputUsdPerM)} per 1M input/output tokens; ${b.label} runs ${formatPerM(b.inputUsdPerM)}/${formatPerM(b.outputUsdPerM)}.`
        : `${a.label} and ${b.label} cost the same on this workload (${formatPerM(a.inputUsdPerM)}/${formatPerM(a.outputUsdPerM)} per 1M tokens).`,
    },
    {
      q: `Which has the larger context window?`,
      a: f.biggerContext
        ? `${f.biggerContext.label}, at ${f.biggerContext.contextWindow.toLocaleString("en-US")} tokens versus ${(f.biggerContext.slug === a.slug ? b : a).contextWindow.toLocaleString("en-US")}.`
        : `Both support a ${a.contextWindow.toLocaleString("en-US")}-token context window.`,
    },
    {
      q: `How accurate are these token counts?`,
      a: `${a.label}: ${APPROX_DRIFT[a.vendor].blurb} ${b.label}: ${APPROX_DRIFT[b.vendor].blurb} The dollar math itself is exact once the token count is known.`,
    },
  ];

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
            <Link href="/compare" className="hover:text-(--text)">
              Compare
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-(--text)" aria-current="page">
            {a.label} vs {b.label}
          </li>
        </ol>
      </nav>

      <Byline verified={verified} />

      <article className="prose prose-invert max-w-none prose-headings:tracking-tight prose-h1:text-3xl prose-h1:font-semibold prose-h2:mt-12 prose-h2:text-2xl prose-h2:font-semibold prose-a:text-(--accent) prose-a:no-underline prose-strong:text-(--text)">
        <h1>
          {a.label} vs {b.label}: pricing &amp; cost comparison
        </h1>
        <p>
          {f.cheaperInput ? (
            <>
              On input tokens, <strong>{f.cheaperInput.model.label}</strong> is the cheaper of the
              two — {f.cheaperInput.pct}% less per million ({formatPerM(a.inputUsdPerM)} vs{" "}
              {formatPerM(b.inputUsdPerM)}).{" "}
            </>
          ) : (
            <>Both models charge {formatPerM(a.inputUsdPerM)} per million input tokens. </>
          )}
          {f.cheaperOutput ? (
            <>
              On output, <strong>{f.cheaperOutput.model.label}</strong> is {f.cheaperOutput.pct}%
              cheaper ({formatPerM(a.outputUsdPerM)} vs {formatPerM(b.outputUsdPerM)}) — and since
              output is usually the dominant cost driver, that gap matters more than it looks.
            </>
          ) : (
            <>Both charge {formatPerM(a.outputUsdPerM)} per million output tokens.</>
          )}
        </p>

        <h2>Side by side</h2>
        <div className="not-prose overflow-x-auto rounded-xl border border-(--border)">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-(--border) text-left text-(--text-muted)">
                <th className="px-4 py-3 font-medium"> </th>
                <th className="px-4 py-3 font-medium">{a.label}</th>
                <th className="px-4 py-3 font-medium">{b.label}</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              <tr className="border-b border-(--border)">
                <td className="px-4 py-3 text-(--text-muted)">Input / 1M tokens</td>
                <td className="px-4 py-3">{formatPerM(a.inputUsdPerM)}</td>
                <td className="px-4 py-3">{formatPerM(b.inputUsdPerM)}</td>
              </tr>
              <tr className="border-b border-(--border)">
                <td className="px-4 py-3 text-(--text-muted)">Output / 1M tokens</td>
                <td className="px-4 py-3">{formatPerM(a.outputUsdPerM)}</td>
                <td className="px-4 py-3">{formatPerM(b.outputUsdPerM)}</td>
              </tr>
              <tr className="border-b border-(--border)">
                <td className="px-4 py-3 text-(--text-muted)">Context window</td>
                <td className="px-4 py-3">{a.contextWindow.toLocaleString("en-US")}</td>
                <td className="px-4 py-3">{b.contextWindow.toLocaleString("en-US")}</td>
              </tr>
              <tr className="border-b border-(--border)">
                <td className="px-4 py-3 text-(--text-muted)">Token-count accuracy</td>
                <td className="px-4 py-3">{APPROX_DRIFT[a.vendor].label}</td>
                <td className="px-4 py-3">{APPROX_DRIFT[b.vendor].label}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-(--text-muted)">Cost — {exampleLabel}</td>
                <td className="px-4 py-3">{fmtUsd(f.example.aTotal)}</td>
                <td className="px-4 py-3">{fmtUsd(f.example.bTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>What a real request costs</h2>
        <p>
          Take a representative turn — {exampleLabel}. {a.label} comes to{" "}
          <strong>{fmtUsd(f.example.aTotal)}</strong>, {b.label} to{" "}
          <strong>{fmtUsd(f.example.bTotal)}</strong>.{" "}
          {f.example.cheaper ? (
            <>
              Across 100,000 requests that&apos;s a <strong>{fmtUsd(per100k)}</strong> swing in
              favour of {f.example.cheaper.label}. To run the numbers on <em>your</em> actual
              prompt, paste it into the <Link href="/#calculator">calculator</Link> and toggle{" "}
              <strong>Compare across all models</strong>.
            </>
          ) : (
            <>
              They&apos;re identical on this workload, so pick on quality, context window, or
              tokenizer accuracy rather than price. Paste your prompt into the{" "}
              <Link href="/#calculator">calculator</Link> to confirm against your real text.
            </>
          )}
        </p>

        <h2>{angle.heading}</h2>
        <p>{angle.body}</p>
        <p>
          See the full breakdown on the dedicated pages for{" "}
          <Link href={`/token-calculator/${a.slug}`}>{a.label}</Link> and{" "}
          <Link href={`/token-calculator/${b.slug}`}>{b.label}</Link>.
        </p>

        <h2>FAQ</h2>
        <dl>
          {faqs.map((faq) => (
            <div key={faq.q}>
              <dt className="font-semibold text-(--text)">{faq.q}</dt>
              <dd>{faq.a}</dd>
            </div>
          ))}
        </dl>

        <p className="text-xs text-(--text-faint)">
          Both prices are computed from tokenmath&apos;s verified pricing table. Rates sourced from{" "}
          {a.source === b.source ? (
            <a href={a.source} rel="nofollow noopener" target="_blank">
              {new URL(a.source).host}
            </a>
          ) : (
            <>
              <a href={a.source} rel="nofollow noopener" target="_blank">
                {new URL(a.source).host}
              </a>{" "}
              and{" "}
              <a href={b.source} rel="nofollow noopener" target="_blank">
                {new URL(b.source).host}
              </a>
            </>
          )}
          , verified {verified}. Vendor pricing changes often — confirm before you commit.
        </p>
      </article>

      <AdSlot placement="pseo-after-faq" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(faqPageJsonLd(faqs))}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(
          breadcrumbListJsonLd([
            { name: "Home", path: "/" },
            { name: "Compare", path: "/compare" },
            { name: `${a.label} vs ${b.label}`, path: `/compare/${resolved.canonical}` },
          ]),
        )}
      />
    </main>
  );
}
