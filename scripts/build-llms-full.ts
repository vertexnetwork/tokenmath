/**
 * Generates public/llms-full.txt from lib/pricing.ts (MODELS[]) so AI engines crawling the
 * site have a verbatim, up-to-date reference. Wired to `prebuild` in package.json — runs
 * before every `next build`, keeping it in sync without manual steps.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { MODELS, latestDataAsOf } from '../lib/pricing';
import { CHANGELOG } from '../lib/changelog';

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

function buildChangelog(): string {
  if (CHANGELOG.length === 0) return '_No entries yet._';
  return CHANGELOG.map((entry) => {
    const scope = entry.scope ? ` [${entry.scope}]` : '';
    return `- ${entry.date}  ${entry.type}${scope}  ${entry.title}`;
  }).join('\n');
}

function buildContent(): string {
  return `# tokenmath.dev — full reference

Client-side LLM token counter and API cost calculator for Anthropic Claude, Google Gemini, and
OpenAI. Tokenization runs entirely in the browser; nothing about the user's prompt is uploaded
or logged. Pricing data is current as of ${latestDataAsOf()}.

## Pricing table

${buildPricingTable()}

Notes
- Prices are USD per 1,000,000 tokens.
- Tiered models charge a different rate above a token threshold (e.g. Gemini 2.5 Pro doubles
  both input and output prices above 200,000 input tokens).
- "As of" reflects the date pricing was last verified against the vendor's public pricing page.

## Tokenizer notes

- Claude 4.x: approximated via gpt-tokenizer's cl100k_base encoding. Anthropic does not publish
  a current client tokenizer. Calibration factor 1.0 by default; drift typically <2% on
  English and code.
- Gemini 2.5: approximated via js-tiktoken's o200k_base. Google does not publish a client
  tokenizer. Calibration factor 1.0; drift typically ~3% on English.
- OpenAI (GPT-5 family + GPT-4.1 family): exact tokenization via gpt-tokenizer's o200k_base —
  the canonical OpenAI vocab. No approximation, no calibration needed; the count matches what
  OpenAI bills.

## Calculator features

- Home calculator at https://tokenmath.dev/ supports a Compare mode that tokenizes the prompt
  against every supported model and ranks the table by total cost.
- Per-model calculators at /token-calculator/[slug] include worked examples, FAQ, and a
  per-model pricing table dated against the vendor source.
- Saved scenarios store up to 10 prompt + model + response-length combinations on the user's
  browser via localStorage. Nothing is uploaded.
- The result card shows a cost-split bar (input vs output share) and a context-window meter,
  warning when input exceeds the selected model's window.
- A live "verify privacy" panel surfaces real-time counts of outgoing requests, cookies, and
  localStorage keys so users can audit the privacy contract by inspection.

## Privacy contract

- No prompt content is ever transmitted off the user's browser. The only server-rendered
  endpoint is /api/og, which only accepts title + subtitle query strings used to render social
  preview images and never receives prompt input.
- Microsoft Clarity (when enabled) masks all prompt input and cost totals.
- Vercel Web Analytics receives only aggregate event names with bucketed token-count strings;
  never input content.

## Calculator URLs

${MODELS.map((m) => `- ${m.label}: https://tokenmath.dev/token-calculator/${m.slug}`).join('\n')}

## Changelog

${buildChangelog()}

## Reference

- Home: https://tokenmath.dev/
- Models index: https://tokenmath.dev/models
- Pricing data sources: https://tokenmath.dev/pricing-data
- Privacy policy: https://tokenmath.dev/privacy
- Changelog: https://tokenmath.dev/changelog
- About: https://tokenmath.dev/about
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
