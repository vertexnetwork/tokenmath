# tokenmath.dev

Client-side LLM token counter and API cost calculator for Anthropic Claude, Google Gemini,
and OpenAI. Tokenization runs entirely in the browser — your prompts never touch a server.

## Stack

- **Next.js 16** App Router + Turbopack
- **React 19**, **TypeScript** strict mode
- **Tailwind v4** (CSS-first config) + `@tailwindcss/typography`
- **MDX** for per-model pSEO content
- **gpt-tokenizer** (cl100k for Claude) + **js-tiktoken** (o200k for Gemini), lazy-loaded
- **Vercel Analytics** + **Speed Insights** + **Microsoft Clarity** (all prompt/cost masked)
- **pnpm 11** package manager

## Getting started

```bash
pnpm install
cp .env.example .env.local      # Fill in env vars (none are required for dev)
pnpm dev
```

Open http://localhost:3000.

## Scripts

| Command             | What it does                                      |
| ------------------- | ------------------------------------------------- |
| `pnpm dev`          | Start the Turbopack dev server                    |
| `pnpm build`        | Production build (runs `prebuild` → `next build`) |
| `pnpm start`        | Serve the production build                        |
| `pnpm lint`         | ESLint (Next + Prettier rules)                    |
| `pnpm typecheck`    | `tsc --noEmit`                                    |
| `pnpm test`         | Vitest unit tests                                 |
| `pnpm test:e2e`     | Playwright smoke tests                            |
| `pnpm format`       | Prettier write                                    |
| `pnpm format:check` | Prettier check (CI)                               |

## Project layout

```
app/                     Routes (App Router) + metadata files
  api/og/                Edge route — OG image generator (no prompt input)
  token-calculator/[model]/  pSEO routes (SSG, one per model)
components/              UI building blocks
content/models/          MDX pages, one per model
lib/
  pricing.ts             MODELS[] — single source of truth for prices
  tokenizers/            Lazy-loaded tokenizers + Web Worker
  seo.ts                 Metadata + JSON-LD builders
  ads/                   Provider-switched ad components (none / adsense / mediavine / carbon)
  analytics.ts           Typed event helpers
public/                  Static assets, llms.txt, ads.txt, icon.svg
scripts/build-llms-full.ts   Prebuild step — regenerates public/llms-full.txt
scripts/refresh-pricing.ts   CI-only — auto-refreshes lib/pricing.ts from vendor pages
```

## Deploying to Vercel

The project is designed to ship on Vercel Hobby tier and pull no infrastructure beyond what
Vercel provides natively.

### 1. Project setup

```bash
pnpm dlx vercel link        # Link this directory to a Vercel project
```

Project settings:

- **Framework preset**: Next.js (auto-detected)
- **Node version**: 20.x
- **Build command**: `pnpm build` (default)
- **Install command**: `pnpm install --frozen-lockfile`
- **Output directory**: `.next` (default)

### 2. Environment variables

Set these in **Project Settings → Environment Variables** for both Production + Preview.
The full list is in [`.env.example`](.env.example); minimum viable set:

| Var                            | Value                            | Notes                                                      |
| ------------------------------ | -------------------------------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`         | `https://tokenmath.dev`          | Required.                                                  |
| `NEXT_PUBLIC_VERCEL_ANALYTICS` | `1`                              | Optional. Default on.                                      |
| `NEXT_PUBLIC_AD_PROVIDER`      | `adsense`                        | Switch to `carbon` or `mediavine` once those approve.      |
| `NEXT_PUBLIC_RUNPOD_REF_URL`   | `https://runpod.io?ref=…`        | Affiliate link for the contextual cost-cut callout.        |

### 3. Domains

- Bind `tokenmath.dev` (apex) as the **primary** domain.
- Bind `www.tokenmath.dev` as an **alias** that 308-redirects to apex (the redirect rule
  is encoded in [`next.config.ts`](next.config.ts) so it works regardless of how the alias
  is configured at the DNS level).
- `.dev` is HSTS-preloaded by Google; HTTPS is mandatory and HSTS is already set in
  [`next.config.ts`](next.config.ts) `SECURITY_HEADERS`.

### 4. Branch protection

`main` is the production branch. Recommended GitHub branch protection on `main`:

- Require PR
- Require CI green (the `Lint · Typecheck · Test · Build` job in
  [`.github/workflows/ci.yml`](.github/workflows/ci.yml))
- Require Vercel Preview build to succeed
- No force-push

### 5. Pricing auto-refresh

A weekly GitHub Action (`.github/workflows/pricing-refresh.yml`) re-verifies vendor
pricing against the published source URLs and opens a PR if anything drifted. Requires
one secret in GitHub Actions: `ANTHROPIC_API_KEY`. Cost is ~$0.05/month at the configured
weekly cadence.

### 6. Going live

Pre-launch verification: every box in PLAN.md §9.

## Privacy

No prompt content ever leaves the browser. The only serverless function on the site is
`/api/og` — used for social preview images — and it only accepts title + subtitle query
strings used in the OG card itself. See [`/privacy`](app/privacy/page.tsx) for the full
policy.

## License

Source under repo's chosen license. Pricing data is provided as-is from each vendor's
public pricing page; verify against the vendor before relying on it for production budgeting.
