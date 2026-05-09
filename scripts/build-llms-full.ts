/**
 * Generates public/llms-full.txt from lib/pricing.ts (MODELS[]) so AI engines crawling the
 * site have a verbatim, up-to-date reference. Wired to `prebuild` in package.json — runs
 * before every `next build`, keeping it in sync without manual steps.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { MODELS, latestDataAsOf } from '../lib/pricing';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..');
const OUT = resolve(ROOT, 'public/llms-full.txt');

function pad(s: string, n: number): string {
  return s.length >= n ? s : s + ' '.repeat(n - s.length);
}

function buildPricingTable(): string {
  const headers = ['Model', 'Input $/M', 'Output $/M', 'Context', 'Tiers', 'As of', 'Source'];
  const rows = MODELS.map((m) => {
    const tiers = m.tiers
      ? m.tiers.map((t) => `≤${t.upTo ?? '∞'}: $${t.inputUsdPerM}/$${t.outputUsdPerM}`).join(' | ')
      : '—';
    return [
      m.label,
      `$${m.inputUsdPerM}`,
      `$${m.outputUsdPerM}`,
      `${m.contextWindow.toLocaleString('en-US')} tok`,
      tiers,
      m.dataAsOf,
      m.source,
    ];
  });
  const widths = headers.map((h, i) => Math.max(h.length, ...rows.map((r) => r[i].length)));
  const renderRow = (r: string[]) => r.map((c, i) => pad(c, widths[i])).join('  ');
  const lines = [renderRow(headers), widths.map((w) => '-'.repeat(w)).join('  ')];
  rows.forEach((r) => lines.push(renderRow(r)));
  return lines.join('\n');
}

function buildContent(): string {
  return `# tokencount.ai — full reference

Client-side LLM token counter and API cost calculator for Anthropic Claude and Google Gemini.
Tokenization runs entirely in the browser; nothing about the user's prompt is uploaded or
logged. Pricing data is current as of ${latestDataAsOf()}.

## Pricing table

${buildPricingTable()}

Notes
- Prices are USD per 1,000,000 tokens.
- Tiered models charge a different rate above a token threshold (e.g. Gemini 2.5 Pro doubles
  both input and output prices above 200,000 input tokens).
- "As of" reflects the date pricing was last verified against the vendor's public pricing page.

## Tokenizer notes

- Claude 4.x: approximated via gpt-tokenizer's cl100k_base encoding. Anthropic does not publish
  a current client tokenizer; @anthropic-ai/tokenizer is available for older Claude vocab
  (Claude 1/2/3) but is not used here. Calibration factor is 1.0 by default.
- Gemini 2.5: approximated via js-tiktoken's o200k_base. Google does not publish a client
  tokenizer. Calibration factor is 1.0 by default.
- Approximation accuracy is empirically within ±2% across typical prompts. Treat all counts as
  estimates suitable for cost-budgeting, not for billing reconciliation.

## Privacy contract

- No prompt content is ever transmitted off the user's browser. The only server-rendered
  endpoint is /api/og, which only accepts title + subtitle query strings used to render social
  preview images and never receives prompt input.
- Microsoft Clarity (when enabled) masks all prompt input and cost totals.
- Vercel Web Analytics receives only aggregate event names with bucketed token-count strings;
  never input content.

## Calculator URLs

${MODELS.map((m) => `- ${m.label}: https://tokencount.ai/token-calculator/${m.slug}`).join('\n')}

## Reference

- Pricing data sources: https://tokencount.ai/pricing-data
- Privacy policy: https://tokencount.ai/privacy
- About: https://tokencount.ai/about
`;
}

async function main(): Promise<void> {
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, buildContent(), 'utf8');
  console.log(`✓ wrote ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
