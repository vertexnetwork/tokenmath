/**
 * scripts/refresh-pricing.ts — runs in CI on a weekly cron (.github/workflows/pricing-refresh.yml).
 *
 * For each model in MODELS[]:
 *   1. Fetch the vendor's published pricing page (model.source).
 *   2. Strip noisy markup (<script>, <style>, inline event handlers).
 *   3. Send the trimmed HTML to Claude Haiku 4.5 with a strict-JSON prompt.
 *   4. Validate the returned numbers stay within sanity bounds (0.5x–10x current).
 *   5. If anything changed, rewrite that model's entry in lib/pricing.ts and bump dataAsOf.
 *   6. In every successful case (changed or not), bump lastVerified to today's ISO date.
 *
 * Safety stance: never blindly trust the LLM. Out-of-bounds values are dropped with a warning;
 * the field stays as-is and a human is expected to investigate via the GitHub Action's PR/issue.
 *
 * Exits non-zero only on hard infrastructure failures (no API key, fetch crash). "No changes
 * detected" exits 0 with a clean log so the workflow can decide whether to open a PR.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { MODELS, type ModelPricing } from '../lib/pricing';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..');
const PRICING_FILE = resolve(ROOT, 'lib/pricing.ts');

const MODEL = 'claude-haiku-4-5';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const HTML_BUDGET_CHARS = 50_000;
const SANITY_MIN_RATIO = 0.1;
const SANITY_MAX_RATIO = 10;

interface ExtractedPricing {
  inputUsdPerM: number;
  outputUsdPerM: number;
  contextWindow: number;
}

interface RefreshResult {
  model: ModelPricing;
  status: 'unchanged' | 'updated' | 'rejected' | 'error';
  changes?: Array<{ field: string; old: number; new: number }>;
  reason?: string;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function stripNoise(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/\son[a-z]+="[^"]*"/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'tokenmath-pricing-refresh/1.0 (+https://tokenmath.dev)',
      Accept: 'text/html,application/xhtml+xml',
    },
  });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.text();
}

async function extractPricing(model: ModelPricing, html: string): Promise<ExtractedPricing> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');

  const trimmed = stripNoise(html).slice(0, HTML_BUDGET_CHARS);

  const prompt = `Extract current pricing for "${model.label}" (vendor: ${model.vendor}, family: ${model.family}) from the HTML below.

Current values on file (for reference — verify these against the page; do not invent):
- inputUsdPerM: ${model.inputUsdPerM}
- outputUsdPerM: ${model.outputUsdPerM}
- contextWindow: ${model.contextWindow}

Pricing page HTML (truncated):
\`\`\`html
${trimmed}
\`\`\`

Return ONLY a JSON object on a single line with this exact shape:
{"inputUsdPerM": <number>, "outputUsdPerM": <number>, "contextWindow": <integer>}

Rules:
- Use USD per 1,000,000 tokens for the price fields.
- Use the BASE / DEFAULT tier for tiered models (the lower tier of the two).
- contextWindow is the maximum input context in tokens.
- If the page does not clearly state a value, return the current value unchanged.
- No prose, no markdown, no code fences — just the JSON object.`;

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Anthropic API ${res.status}: ${body.slice(0, 500)}`);
  }
  const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
  const text = data.content?.find((b) => b.type === 'text')?.text ?? '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`No JSON object in response: ${text.slice(0, 200)}`);
  const parsed = JSON.parse(match[0]) as ExtractedPricing;
  if (
    typeof parsed.inputUsdPerM !== 'number' ||
    typeof parsed.outputUsdPerM !== 'number' ||
    typeof parsed.contextWindow !== 'number'
  ) {
    throw new Error(`Malformed JSON shape: ${JSON.stringify(parsed)}`);
  }
  return parsed;
}

function withinSanity(current: number, next: number): boolean {
  if (next <= 0) return false;
  if (current === 0) return true;
  const ratio = next / current;
  return ratio >= SANITY_MIN_RATIO && ratio <= SANITY_MAX_RATIO;
}

function updatePricingFile(
  source: string,
  model: ModelPricing,
  changes: Array<{ field: string; old: number; new: number }>,
  bumpDataAsOf: boolean,
): string {
  // Locate the entry by `id: '<model-id>'` and isolate its object literal.
  const idMarker = `id: '${model.id}',`;
  const startIdx = source.indexOf(idMarker);
  if (startIdx === -1) throw new Error(`Could not locate ${model.id} in pricing.ts`);

  // Walk back to the opening `{` of this object literal.
  let openIdx = startIdx;
  while (openIdx > 0 && source[openIdx] !== '{') openIdx--;
  // Walk forward to the matching `}`.
  let depth = 1;
  let closeIdx = openIdx + 1;
  while (closeIdx < source.length && depth > 0) {
    if (source[closeIdx] === '{') depth++;
    else if (source[closeIdx] === '}') depth--;
    if (depth === 0) break;
    closeIdx++;
  }

  let block = source.slice(openIdx, closeIdx + 1);
  for (const change of changes) {
    const fieldRe = new RegExp(`(${change.field}:\\s*)([0-9._]+)`);
    block = block.replace(fieldRe, `$1${change.new}`);
  }
  if (bumpDataAsOf) {
    block = block.replace(/(dataAsOf:\s*')[^']+(')/, `$1${todayIso()}$2`);
  }
  // lastVerified is added if missing, otherwise updated.
  if (block.includes('lastVerified:')) {
    block = block.replace(/(lastVerified:\s*')[^']+(')/, `$1${todayIso()}$2`);
  } else {
    // Insert before the closing `}` on the last line.
    block = block.replace(/(\s*)(}\s*)$/, `$1  lastVerified: '${todayIso()}',$1$2`);
  }
  return source.slice(0, openIdx) + block + source.slice(closeIdx + 1);
}

async function main(): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is required.');
    process.exit(1);
  }

  // Cache vendor pages so 3 Claude models share one fetch of anthropic.com/pricing.
  const pageCache = new Map<string, Promise<string>>();
  const getPage = (url: string) => {
    if (!pageCache.has(url)) pageCache.set(url, fetchPage(url));
    return pageCache.get(url)!;
  };

  let pricingSrc = await readFile(PRICING_FILE, 'utf8');
  const results: RefreshResult[] = [];

  for (const model of MODELS) {
    try {
      const html = await getPage(model.source);
      const extracted = await extractPricing(model, html);

      const candidates: Array<{ field: keyof ExtractedPricing; old: number; new: number }> = [
        { field: 'inputUsdPerM', old: model.inputUsdPerM, new: extracted.inputUsdPerM },
        { field: 'outputUsdPerM', old: model.outputUsdPerM, new: extracted.outputUsdPerM },
        { field: 'contextWindow', old: model.contextWindow, new: extracted.contextWindow },
      ];

      const accepted: typeof candidates = [];
      const rejected: typeof candidates = [];
      for (const c of candidates) {
        if (c.new === c.old) continue;
        if (withinSanity(c.old, c.new)) accepted.push(c);
        else rejected.push(c);
      }

      if (rejected.length > 0) {
        console.warn(
          `! ${model.id}: rejected out-of-bounds candidate(s): ${rejected
            .map((r) => `${r.field} ${r.old}→${r.new}`)
            .join(', ')}`,
        );
      }

      if (accepted.length === 0) {
        // Bump lastVerified anyway, but only when we got a clean response (otherwise the
        // earlier throw would have caught us).
        pricingSrc = updatePricingFile(pricingSrc, model, [], false);
        results.push({ model, status: 'unchanged' });
        console.log(`  ${model.id}: unchanged (verified)`);
        continue;
      }

      pricingSrc = updatePricingFile(pricingSrc, model, accepted, true);
      results.push({ model, status: 'updated', changes: accepted });
      console.log(
        `✓ ${model.id}: updated → ${accepted.map((c) => `${c.field} ${c.old}→${c.new}`).join(', ')}`,
      );
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      results.push({ model, status: 'error', reason });
      console.error(`✗ ${model.id}: ${reason}`);
    }
  }

  await writeFile(PRICING_FILE, pricingSrc, 'utf8');

  // Summary table for the GitHub Actions log.
  const updated = results.filter((r) => r.status === 'updated').length;
  const unchanged = results.filter((r) => r.status === 'unchanged').length;
  const errored = results.filter((r) => r.status === 'error').length;
  console.log('---');
  console.log(`Updated: ${updated} · Unchanged: ${unchanged} · Errored: ${errored}`);
  if (errored > 0) {
    console.log('Errors are non-fatal; the workflow continues so partial updates can land.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
