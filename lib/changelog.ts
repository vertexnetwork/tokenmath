/**
 * Source-of-truth changelog. Surfaces on /changelog and is concatenated into
 * /llms-full.txt at build time so AI engines crawling the site see what changed and when.
 *
 * Convention:
 *   - `date` is ISO YYYY-MM-DD, the day the change shipped to production.
 *   - `title` reads as a headline ("Editorial redesign", not "fix: button alignment").
 *   - `changes` are user-visible bullet points; skip refactors that don't change behaviour.
 *   - Newest entries first.
 */

export interface ChangelogEntry {
  date: string;
  title: string;
  summary?: string;
  changes: string[];
}

export const CHANGELOG: readonly ChangelogEntry[] = [
  {
    date: '2026-05-09',
    title: 'Editorial redesign',
    summary:
      'A visual overhaul plus compare mode, saved scenarios, and live privacy receipts — the redesign moves the calculator from a serviceable utility to something that looks and behaves like a deliberate piece of dev infrastructure.',
    changes: [
      'Redesigned every surface in an Editorial Quiet style: layered warm-dark, hero total in parchment gold (mono, tabular), Source Serif 4 accent on editorial pages.',
      'Compare mode — toggle on the home calculator to see your prompt scored against all 10 models in a single sortable table.',
      'Saved scenarios — keep up to 10 prompt + model + response-length combinations on this browser. Stored only in localStorage; nothing is uploaded.',
      'Privacy receipts panel — live counters of outgoing requests, cookies, and localStorage keys so the privacy contract is verifiable by inspection.',
      'Cost-split bar and context-window meter inline on the result card.',
      'Mobile sticky total bar that surfaces the answer when the result card scrolls out of view.',
      'Models index: vendor filters, sort by cost or context window, multi-select for side-by-side comparison.',
      'Keyboard shortcuts — press ? for the full list. Includes Linear-style g-then-letter navigation.',
      'New wordmark, monogram favicon, and per-model OG cards rebuilt to match.',
      'Calibrated empty-state example chips so first-time visitors see a real result in one click.',
    ],
  },
  {
    date: '2026-05-08',
    title: 'OpenAI added; brand renamed to tokenmath',
    summary:
      'GPT-5 and GPT-4.1 families now use exact tokenization; the rest stay approximate. Project renamed from tokencount to tokenmath.',
    changes: [
      'Added GPT-5, GPT-5 Mini, GPT-5 Nano, GPT-4.1, and GPT-4.1 Mini with exact o200k_base tokenization.',
      'Brand and domain renamed: tokenmath / tokenmath.dev.',
      'Pricing data verified against Anthropic, Google, and OpenAI public pricing pages on 2026-05-09.',
      'pSEO routes regenerated with refreshed worked examples per family.',
    ],
  },
  {
    date: '2026-05-01',
    title: 'Initial release',
    summary:
      'Client-side LLM token counter for Anthropic Claude and Google Gemini. Tokenization in JavaScript on the user’s browser; nothing about the prompt leaves the device.',
    changes: [
      'Claude 4.5 Sonnet, Claude 4.5 Haiku, Claude 4.7 Opus, Gemini 2.5 Pro, and Gemini 2.5 Flash supported with cl100k_base / o200k_base approximations.',
      'Tiered pricing modeled correctly (Gemini 2.5 Pro doubles input + output above 200k input tokens).',
      'Web Worker tokenization for inputs longer than 50,000 characters so the page stays responsive.',
      'WebApplication, SoftwareApplication, FAQPage, BreadcrumbList, and Organization JSON-LD on the relevant routes.',
      'Programmatic SEO under /token-calculator/[model] with worked examples and per-model FAQ.',
    ],
  },
] as const;

export function latestChange(): ChangelogEntry {
  return CHANGELOG[0];
}
