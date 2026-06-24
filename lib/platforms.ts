/**
 * The platform cost-panic axis. Vibe coders don't search "gpt-5-mini token calculator" —
 * they search "why is my Cursor bill so high." These pages target that intent: explain how a
 * given AI-coding/app-building platform meters cost (credits, fast requests, BYO key), why
 * bills surprise people, and route them to the calculator to estimate the underlying model
 * spend.
 *
 * Every price/credit fact MUST carry a primary `source` URL and a `dataAsOf` date — same
 * credibility bar as MODELS[]. Nothing goes in this array that isn't verifiable from the
 * platform's own pricing page. Entries are populated from sourced research; an empty array
 * publishes zero pages, which is the correct default until data is verified.
 */

export interface PlatformPlan {
  name: string;
  /** Headline price in USD, or null for "custom"/"contact sales". */
  priceUsd: number | null;
  period: "mo" | "yr" | "once" | "usage";
  /** Short qualifier, e.g. "billed annually" or "+ usage over included credits". */
  note?: string;
}

export type PlatformCategory = "ai-coding-ide" | "app-builder" | "coding-agent" | "assistant";

export type MeteringModel =
  | "credits"
  | "fast-requests"
  | "byo-api-key"
  | "usage-based"
  | "subscription-flat";

export interface Platform {
  slug: string;
  name: string;
  category: PlatformCategory;
  /** One-liner for cards/meta. */
  tagline: string;
  metering: MeteringModel;
  /** Prose: how the platform's unit (credit/request) maps to underlying LLM token cost. */
  howItMaps: string;
  /** The cost-panic angle — the #1 reason bills surprise users here. */
  surpriseBillReason: string;
  plans: PlatformPlan[];
  /** Underlying model labels users are effectively paying for (ties to the calculator). */
  underlyingModels: string[];
  /** Official pricing page. */
  source: string;
  /** ISO date the pricing was sourced. */
  dataAsOf: string;
  /** ISO date last re-checked (defaults to dataAsOf). */
  lastVerified?: string;
}

export const PLATFORMS: readonly Platform[] = [
  {
    slug: "cursor",
    name: "Cursor",
    category: "ai-coding-ide",
    tagline:
      "An AI-first code editor that meters frontier-model use against a dollar-denominated usage pool.",
    metering: "usage-based",
    howItMaps:
      "Since mid-2025 Cursor bills against a dollar pool rather than “fast requests.” Frontier models (Claude Opus, GPT-5) are charged at each provider’s published API rate with little markup for individuals; Teams add a $0.25 per-million-token surcharge on top. The Auto/Composer pool is generous, but the frontier pool drains at roughly raw API prices.",
    surpriseBillReason:
      "Switching to an expensive frontier model like Claude Opus can drain the $20 included pool in a handful of prompts — and once it’s empty, usage auto-bills at API rates unless you set a spend cap. The June 2025 move to this model drew enough backlash that Cursor issued a public apology and refunds.",
    plans: [
      { name: "Hobby", priceUsd: 0, period: "mo" },
      { name: "Pro", priceUsd: 20, period: "mo", note: "~$20 included usage" },
      { name: "Pro+", priceUsd: 60, period: "mo", note: "~$70 included usage" },
      { name: "Ultra", priceUsd: 200, period: "mo", note: "~$400 included usage" },
      { name: "Teams", priceUsd: 40, period: "mo", note: "/user · +$0.25/M-token surcharge" },
    ],
    underlyingModels: ["Claude (Opus & Sonnet)", "GPT-5", "Gemini 2.5"],
    source: "https://cursor.com/pricing",
    dataAsOf: "2026-06-23",
    lastVerified: "2026-06-23",
  },
  {
    slug: "github-copilot",
    name: "GitHub Copilot",
    category: "ai-coding-ide",
    tagline:
      "The pair-programmer that moved to usage-based AI Credits (1 credit = $0.01) in June 2026.",
    metering: "credits",
    howItMaps:
      "As of June 1 2026, Copilot meters premium-model use as GitHub AI Credits where 1 credit = $0.01, consumed by token usage at each model’s published API rate. Code completions stay unlimited and unbilled; only agent and chat use against premium models draws down credits.",
    surpriseBillReason:
      "Picking a frontier model (Claude Opus, GPT-5.5) burns the small $15 Pro credit pool in a few token-heavy agent runs, after which usage continues at full per-token rates against your budget. The launch blog and plans page even disagree on the included-credit amounts, so the numbers are still settling.",
    plans: [
      { name: "Free", priceUsd: 0, period: "mo", note: "2,000 completions/mo" },
      { name: "Pro", priceUsd: 10, period: "mo", note: "$15 credits" },
      { name: "Pro+", priceUsd: 39, period: "mo", note: "$70 credits" },
      { name: "Max", priceUsd: 100, period: "mo", note: "$200 credits" },
      { name: "Business", priceUsd: 19, period: "mo", note: "/seat" },
    ],
    underlyingModels: ["Claude Sonnet & Opus", "GPT-5"],
    source: "https://github.com/features/copilot/plans",
    dataAsOf: "2026-06-23",
    lastVerified: "2026-06-23",
  },
  {
    slug: "claude-code",
    name: "Claude Code",
    category: "coding-agent",
    tagline:
      "Anthropic’s terminal coding agent — pay a flat Claude subscription or raw API tokens.",
    metering: "subscription-flat",
    howItMaps:
      "On a Claude subscription, Claude Code is bundled into a flat fee with rolling 5-hour and weekly usage caps — no per-token bill. On API pay-as-you-go it’s literal token passthrough at list price (Opus $5/$25, Sonnet $3/$15, Haiku $1/$5 per 1M tokens; cached reads ~0.1×).",
    surpriseBillReason:
      "Running Claude Code on API pay-as-you-go with Opus is the trap: agentic loops re-send the full history plus tool results every turn, so heavy daily use can reach hundreds to thousands per month versus a capped $100–200 Max subscription.",
    plans: [
      { name: "Free", priceUsd: 0, period: "mo", note: "no Claude Code" },
      { name: "Pro", priceUsd: 20, period: "mo" },
      { name: "Max 5×", priceUsd: 100, period: "mo" },
      { name: "Max 20×", priceUsd: 200, period: "mo" },
    ],
    underlyingModels: ["Claude Opus", "Claude Sonnet", "Claude Haiku"],
    source: "https://claude.com/pricing",
    dataAsOf: "2026-06-23",
    lastVerified: "2026-06-23",
  },
  {
    slug: "replit",
    name: "Replit",
    category: "app-builder",
    tagline:
      "Cloud IDE whose Agent bills by “effort” — you pay for the work it performs, success or not.",
    metering: "usage-based",
    howItMaps:
      "Replit Agent uses effort-based pricing via checkpoints: simple tasks may cost under $0.25, complex ones more, drawn from your monthly credit balance. Third-party models bill at provider rates. The exact effort rates aren’t published.",
    surpriseBillReason:
      "The Agent burns credits on failed, looping, or rolled-back work exactly like successful work, and overages bill to your card with no prompt — community reports cite surprise charges in the hundreds after retry loops.",
    plans: [
      { name: "Starter", priceUsd: 0, period: "mo" },
      { name: "Core", priceUsd: 25, period: "mo", note: "$20 annual · $25 credits included" },
      { name: "Pro", priceUsd: 100, period: "mo", note: "$95 annual · $100 credits" },
    ],
    underlyingModels: ["Claude", "GPT-5"],
    source: "https://replit.com/pricing",
    dataAsOf: "2026-06-23",
    lastVerified: "2026-06-23",
  },
  {
    slug: "bolt",
    name: "Bolt.new",
    category: "app-builder",
    tagline:
      "Browser-based full-stack app builder that meters standard LLM tokens, not abstract credits.",
    metering: "usage-based",
    howItMaps:
      "Bolt bills in standard LLM tokens (input + output), not an opaque currency — Free gives 300K/day and 1M/mo, Pro starts at 10M/mo. There’s no published per-token USD markup.",
    surpriseBillReason:
      "Token burn scales with project size, not edit size: Bolt re-reads and re-syncs your whole project on every message, so a large codebase or a debugging loop re-sends everything and drains your monthly tokens fast.",
    plans: [
      { name: "Free", priceUsd: 0, period: "mo", note: "300K tokens/day · 1M/mo" },
      { name: "Pro", priceUsd: 25, period: "mo", note: "from 10M tokens/mo" },
      { name: "Teams", priceUsd: 30, period: "mo", note: "/member" },
    ],
    underlyingModels: ["Claude"],
    source: "https://bolt.new/pricing",
    dataAsOf: "2026-06-23",
    lastVerified: "2026-06-23",
  },
  {
    slug: "v0",
    name: "v0 (Vercel)",
    category: "app-builder",
    tagline:
      "Vercel’s generative-UI tool, now metered on input/output tokens converted to dollar credits.",
    metering: "credits",
    howItMaps:
      "v0 meters input and output tokens that convert to credits, billed against v0’s own model names (Mini $1/$5, Pro $3/$15, Max $5/$25 per 1M) rather than the underlying provider SKU — so the markup isn’t disclosed. Credits roll over but expire after 65 days.",
    surpriseBillReason:
      "There’s a 10× cost spread between v0 Mini and v0 Max Fast; pasting large contexts on a high tier drains credits fast, and the recent shift from a predictable 7-messages/day cap to token metering caught many users off guard.",
    plans: [
      { name: "Free", priceUsd: 0, period: "mo", note: "$5 credits · 7 msgs/day" },
      { name: "Team", priceUsd: 30, period: "mo", note: "/user · $30 credits + $2/day" },
      { name: "Business", priceUsd: 100, period: "mo", note: "/user" },
    ],
    underlyingModels: ["OpenAI & Anthropic models (repackaged as v0 Mini/Pro/Max)"],
    source: "https://v0.app/pricing",
    dataAsOf: "2026-06-23",
    lastVerified: "2026-06-23",
  },
  {
    slug: "lovable",
    name: "Lovable",
    category: "app-builder",
    tagline:
      "Prompt-to-app builder metered in credits, with a separate usage bill for the apps you ship.",
    metering: "credits",
    howItMaps:
      "Lovable spends credits per message — a flat 1 credit in Plan Mode, a variable 0.5–2.0+ in Build Mode by complexity — with no published token-to-credit ratio. Shipped apps add a second layer: deployed apps meter Cloud hosting and AI-gateway calls separately.",
    surpriseBillReason:
      "Dual-layer billing surprises people: your subscription only covers building, while apps you deploy incur separate usage-based hosting and AI overage. Stopped or failed Build-mode requests are still charged for work completed so far.",
    plans: [
      { name: "Free", priceUsd: 0, period: "mo", note: "daily credit grant" },
      { name: "Pro", priceUsd: 25, period: "mo", note: "price renders client-side — verify" },
      { name: "Business", priceUsd: 50, period: "mo", note: "verify on pricing page" },
    ],
    underlyingModels: ["Claude", "GPT-5"],
    source: "https://lovable.dev/pricing",
    dataAsOf: "2026-06-23",
    lastVerified: "2026-06-23",
  },
  {
    slug: "windsurf",
    name: "Windsurf (now Devin Desktop)",
    category: "ai-coding-ide",
    tagline:
      "Codeium’s Windsurf editor was acquired by Cognition and rebranded Devin Desktop — its pricing now mirrors Devin’s token-quota model.",
    metering: "usage-based",
    howItMaps:
      "windsurf.com/pricing now redirects to devin.ai/pricing. The old credit system was retired (~March 2026) for a token-based daily/weekly quota: first-party models bill a fixed rate per message, frontier models bill in proportion to tokens used. The token-to-quota conversion isn’t published.",
    surpriseBillReason:
      "Overage is uncapped: the quota limits only your included allowance, not your spend. Once the allowance is exhausted, usage continues at full API list prices.",
    plans: [
      { name: "Free", priceUsd: 0, period: "mo" },
      { name: "Pro", priceUsd: 20, period: "mo" },
      { name: "Max", priceUsd: 200, period: "mo" },
      { name: "Teams", priceUsd: 80, period: "mo", note: "base + $40/seat" },
    ],
    underlyingModels: ["SWE-1.5 (first-party)", "Claude", "GPT-5"],
    source: "https://devin.ai/pricing",
    dataAsOf: "2026-06-23",
    lastVerified: "2026-06-23",
  },
];

export function listPlatformSlugs(): string[] {
  return PLATFORMS.map((p) => p.slug);
}

export function getPlatformBySlug(slug: string): Platform | undefined {
  return PLATFORMS.find((p) => p.slug === slug);
}
