# tokenmath.dev

Client-side LLM token counter and API cost calculator for Anthropic Claude, Google Gemini,
and OpenAI. Tokenization runs entirely in the browser — your prompts never touch a server.

Part of the [Vertex Network](https://github.com/vertexnetwork/vertex-network-hub).

## Stack

- **Next.js 16** App Router + Turbopack
- **React 19**, **TypeScript 5** strict mode, `@/*` path alias
- **Tailwind v4** (CSS-first, M3-style design tokens) + `@tailwindcss/typography`
- **MDX** (`@next/mdx` + `remark-gfm` + `rehype-slug` + `rehype-autolink-headings`)
- **gpt-tokenizer** (cl100k for Claude) + **js-tiktoken** (o200k for Gemini), lazy-loaded
- **Vercel Analytics** + **Speed Insights** + **Microsoft Clarity** (consent-gated)
- **Node 22** (`.nvmrc`), **pnpm 11** (`packageManager` in package.json)

## The keystone — `lib/site-config.ts`

Every brand string, theme color, nav link, feature flag, and verification token funnels
through one typed object. Per the [Vertex Network spec §4](https://github.com/vertexnetwork/vertex-network-hub/blob/main/docs/_scaffold-spec.md#4-the-keystone--libsite-configts):
a hardcoded `name`, `domain`, `email`, social handle, disclaimer, or nav link in any other
file is an audit failure.

If you need to add a new piece of brand-shaped data anywhere in the app, it should be a
field on `siteConfig`, populated either from a literal in `lib/site-config.ts` or from
a `NEXT_PUBLIC_*` env var.

## Getting started

```bash
pnpm install
cp .env.example .env.local      # Identity vars have project defaults; verification + IDs are optional
pnpm dev
```

Open <http://localhost:3000>.

## Scripts

| Command             | What it does                                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`          | Start the Turbopack dev server                                                                                      |
| `pnpm prebuild`     | Generate favicons (`scripts/generate-favicon.ts`) + changelog + `llms.txt` + `llms-full.txt` from `lib/pricing.ts`. |
| `pnpm build`        | Production build (runs `prebuild` → `next build`)                                                                   |
| `pnpm start`        | Serve the production build                                                                                          |
| `pnpm lint`         | ESLint (Next + Prettier rules)                                                                                      |
| `pnpm typecheck`    | `tsc --noEmit`                                                                                                      |
| `pnpm test`         | Vitest unit tests                                                                                                   |
| `pnpm test:e2e`     | Playwright (smoke + a11y + OG snapshot)                                                                             |
| `pnpm format`       | Prettier write                                                                                                      |
| `pnpm format:check` | Prettier check (CI)                                                                                                 |
| `pnpm lhci`         | Lighthouse CI (mobile preset, CLS = 0)                                                                              |

## Project layout

```
app/
  layout.tsx                  Root chrome — metadata, fonts, ConsentProvider, SiteSchema
  globals.css                 @theme tokens (M3-style) + utility classes
  page.tsx                    Home calculator
  about/  contact/  privacy/
  terms/  changelog/  network/   The six required pages (spec §7)
  not-found.tsx               CONFIG-driven 404
  api/og/route.tsx            Edge OG generator (no prompt input ever)
  opengraph-image.tsx         Root OG fallback (next/og convention file)
  twitter-image.tsx           Re-exports the OG fallback
  icon.tsx + apple-icon.tsx   PNG variants from siteConfig.brand
  manifest.ts                 PWA manifest, all icon sizes
  robots.ts                   Reads public/ai-bots.json (HUB-synced)
  sitemap.ts                  All 9 static routes + per-model pSEO
  token-calculator/[model]/   pSEO routes (one per supported model)

components/
  Header.tsx Footer.tsx       Site chrome — read siteConfig.nav
  Wordmark.tsx                Brand mark — reads siteConfig.name
  VertexFooterLink.tsx        Mandatory "Part of the Vertex Network" → /network
  AdSlot.tsx AdsProviderScript.tsx
  AffiliateSlot.tsx           Generic single-affiliate slot (NEXT_PUBLIC_AFFILIATE_*)
  Calculator.tsx ResultCard.tsx ...    Product UI (SPOKE — not template)
  consent/ConsentProvider.tsx + CookieConsent.tsx    Gates Clarity per spec §9
  seo/JsonLd.tsx + SiteSchema.tsx      Reusable JSON-LD emitters

lib/
  site-config.ts              THE KEYSTONE — see above
  network.ts                  Reads public/network.json (HUB-synced sister sites)
  csp.ts                      Provider-aware buildCSP() — used by next.config.ts
  pricing.ts                  MODELS[] — single source of truth for prices (SPOKE)
  tokenizers/                 Lazy-loaded tokenizers + Web Worker (SPOKE)
  seo.ts                      Metadata + JSON-LD builders
  ads/                        Provider-switched ad components
  analytics.ts                Typed event helpers (incl. mandatory vertex_footer_opened)
  clarity.tsx                 Microsoft Clarity loader, consent-gated
  changelog.ts                Re-export of generated changelog (date + title only)

content/models/               Per-model MDX (one per supported model — SPOKE)

public/
  network.json                HUB-synced — Vertex Network registry (consumed by /network)
  ai-bots.json                HUB-synced — AI crawler allowlist (consumed by app/robots.ts)
  ads.txt + app-ads.txt       HUB-synced templates
  humans.txt                  HUB-synced credits
  .well-known/security.txt    RFC 9116 (CONFIG-driven from siteConfig.security)
  icon.svg                    Brand mark (SPOKE)
  favicon-16/32.png  icon-192/512.png  apple-touch-icon-180.png  favicon.ico
                              All generated from public/icon.svg by prebuild
  llms.txt llms-full.txt      Generated by prebuild from siteConfig + MODELS[]

scripts/
  build-changelog.ts          git log → lib/changelog.generated.ts (date + title only)
  build-llms-txt.ts           Concise llms.txt from siteConfig
  build-llms-full.ts          Long-form llms-full.txt from MODELS[] + changelog
  generate-favicon.ts         sharp → multi-size favicon set
  refresh-pricing.ts          Weekly cron — auto-refreshes lib/pricing.ts (SPOKE)

.github/workflows/
  ci.yml                      Lint · typecheck · test · build (runs on push + PR)
  lighthouse.yml              Mobile budgets, CLS = 0
  sync-from-hub.yml           repository_dispatch listener — pulls hub-owned files
  sitemap-ping.yml            Pings Bing IndexNow + Google after main pushes
  screenshot-bot.yml          Pushes /network preview tile to vertex-network-hub
  broken-links.yml            Weekly lychee crawl of prod URLs
  pricing-refresh.yml         Weekly auto-PR refreshing lib/pricing.ts (SPOKE)
```

## Development workflow (GitHub Flow)

```
main  ────●──────●──────●──────●──   (production — protected)
           ↑       ↑      ↑      ↑
           merge after CI ✅ + Vercel preview 👍
           │
   feat/foo │  fix/bar │  chore/baz   ← one branch per change, each gets a Vercel preview URL
```

1. Branch off `main`: `git switch -c feat/<short-name>`.
2. Push the branch: Vercel automatically builds it and posts a preview URL on the PR.
3. CI runs on every push (`Lint · Typecheck · Test · Build` + `Lighthouse mobile budgets`).
4. Open a PR into `main`. Wait for CI ✅ and the Vercel preview to deploy.
5. Test the preview URL.
6. Merge → Vercel deploys to production at `tokenmath.dev`.

### Required GitHub branch protection on `main`

Configure in **Repo Settings → Branches → Add classic branch protection rule** (or
Rulesets):

- ✅ **Require a pull request before merging** (1 approval is fine for solo work; you can
  approve your own PRs)
- ✅ **Require status checks to pass before merging** — select:
  - `Lint · Typecheck · Test · Build` (from `.github/workflows/ci.yml`)
  - `Lighthouse mobile budgets` (from `.github/workflows/lighthouse.yml`)
  - `Vercel` (added automatically once Vercel sees your repo — gates on preview build)
- ✅ **Require branches to be up to date before merging**
- ✅ **Do not allow bypassing the above settings**
- ✅ **Restrict deletions** + ❌ **Allow force pushes** (off)

This means: no direct push to `main`, ever. Every change goes through a PR with a green
preview URL.

## Deploying to Vercel

The project is designed to ship on the Vercel Hobby tier and pull no infrastructure
beyond what Vercel provides natively.

### 1. Project setup

```bash
pnpm dlx vercel link        # Link this directory to a Vercel project
```

Project settings:

- **Framework preset**: Next.js (auto-detected)
- **Node version**: **22.x** (matches `.nvmrc`)
- **Build command**: `pnpm build` (default)
- **Install command**: `pnpm install --frozen-lockfile`
- **Output directory**: `.next` (default)
- **Root directory**: `./` (project root)

### 2. Environment variables

Set these in **Project Settings → Environment Variables**. Apply to **Production**,
**Preview**, _and_ **Development** unless noted otherwise. The full set with comments is
in [`.env.example`](.env.example); the table below is the canonical mapping.

#### Required identity (per Vertex Network spec §13)

| Var                              | Production value                                                        | Preview value                       | Notes                               |
| -------------------------------- | ----------------------------------------------------------------------- | ----------------------------------- | ----------------------------------- |
| `NEXT_PUBLIC_SITE_NAME`          | `tokenmath`                                                             | same                                | Brand name shown to users           |
| `NEXT_PUBLIC_SITE_SHORT_NAME`    | `tokenmath`                                                             | same                                | ≤12 chars; PWA `short_name`         |
| `NEXT_PUBLIC_SITE_DOMAIN`        | `tokenmath.dev`                                                         | (omit — uses Vercel preview domain) | Bare hostname                       |
| `NEXT_PUBLIC_SITE_URL`           | `https://tokenmath.dev`                                                 | (omit — Vercel sets `VERCEL_URL`)   | Canonical absolute URL              |
| `NEXT_PUBLIC_SITE_DESCRIPTION`   | `Accurate token math for Claude, Gemini, and OpenAI. 100% client-side.` | same                                | OG description; llms.txt header     |
| `NEXT_PUBLIC_SITE_CONTACT_EMAIL` | `hello@tokenmath.dev`                                                   | same                                | Surfaced on /contact + security.txt |

#### SEO verification (Production only)

| Var                                    | Value                                | How to get it                                            |
| -------------------------------------- | ------------------------------------ | -------------------------------------------------------- |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | _(token from Google Search Console)_ | GSC → Add property → "HTML tag" verification, copy token |
| `NEXT_PUBLIC_BING_SITE_VERIFICATION`   | _(token from Bing Webmaster)_        | Bing Webmaster → Add a site → "Meta tag" option          |

#### Analytics

| Var                              | Value                       | Notes                                                |
| -------------------------------- | --------------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_VERCEL_ANALYTICS`   | `1`                         | Default on. Set to `0` to disable everywhere.        |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | _(your Clarity project ID)_ | Clarity loads ONLY when set AND user grants consent. |

#### Ads (provider switch)

| Var                                       | Value                                          | Notes                                               |
| ----------------------------------------- | ---------------------------------------------- | --------------------------------------------------- |
| `NEXT_PUBLIC_AD_PROVIDER`                 | `none` \| `adsense` \| `mediavine` \| `carbon` | Defaults to `none`. Set to `adsense` once approved. |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID`           | `ca-pub-XXXXXXXXXXXXXXXX`                      | From AdSense.                                       |
| `NEXT_PUBLIC_ADSENSE_SLOT_HOME`           | _(slot ID)_                                    | Per-placement slot IDs.                             |
| `NEXT_PUBLIC_ADSENSE_SLOT_PSEO_SIDEBAR`   | _(slot ID)_                                    | Per-placement slot IDs.                             |
| `NEXT_PUBLIC_ADSENSE_SLOT_PSEO_AFTER_FAQ` | _(slot ID)_                                    | Per-placement slot IDs.                             |
| `NEXT_PUBLIC_MEDIAVINE_SITE_ID`           | _(MediaVine site ID)_                          | Set when MediaVine approves.                        |
| `NEXT_PUBLIC_CARBONADS_SERVE_ID`          | _(Carbon serve ID)_                            | Both Carbon vars required together.                 |
| `NEXT_PUBLIC_CARBONADS_PLACEMENT`         | _(Carbon placement)_                           |                                                     |

#### Affiliate (single slot, generic)

| Var                              | Value                       | Notes                                           |
| -------------------------------- | --------------------------- | ----------------------------------------------- |
| `NEXT_PUBLIC_AFFILIATE_URL`      | `https://runpod.io?ref=...` | Single affiliate URL. Renders nothing if unset. |
| `NEXT_PUBLIC_AFFILIATE_LABEL`    | `Compare on RunPod →`       | CTA text                                        |
| `NEXT_PUBLIC_AFFILIATE_PROVIDER` | `runpod`                    | Analytics tag for click telemetry               |

#### Server-only secrets (never `NEXT_PUBLIC_*`)

| Var                 | Where used                             | Notes                                                                                 |
| ------------------- | -------------------------------------- | ------------------------------------------------------------------------------------- |
| `ANTHROPIC_API_KEY` | `pricing-refresh.yml` (GitHub Actions) | Set in **GitHub** repo settings → Secrets, NOT in Vercel. Used by the weekly cron.    |
| `INDEXNOW_KEY`      | `sitemap-ping.yml`                     | GitHub Secret. Generate one and serve `/{key}.txt` containing the same key.           |
| `HUB_PUSH_TOKEN`    | `screenshot-bot.yml`                   | GitHub Secret. PAT with `repo` scope, used to push screenshots to vertex-network-hub. |

### 3. Domains

- Bind `tokenmath.dev` (apex) as the **primary** domain.
- Bind `www.tokenmath.dev` as an **alias** that redirects to apex. Configure this at the
  **Vercel platform level** (Project → Domains → set apex as primary, configure www as a
  redirect). **Do not** add a `next.config.ts` redirect — doing both at once causes
  `ERR_TOO_MANY_REDIRECTS`.
- `.dev` is HSTS-preloaded by Google; HTTPS is mandatory and HSTS is already set in
  [`next.config.ts`](next.config.ts) `SECURITY_HEADERS`.

### 4. Branch protection

See **Development workflow** above for the recommended GitHub branch protection rules.

### 5. Pricing auto-refresh

The weekly GitHub Action (`.github/workflows/pricing-refresh.yml`) re-verifies vendor
pricing against the published source URLs and opens a PR if anything drifted. Requires
one secret in GitHub Actions: `ANTHROPIC_API_KEY`. Cost is ~$0.05/month at the configured
weekly cadence.

### 6. Hub sync

`.github/workflows/sync-from-hub.yml` listens for `repository_dispatch` events from
[vertex-network-hub](https://github.com/vertexnetwork/vertex-network-hub). When the
hub publishes a change to `network.json`, `ai-bots.json`, `ads.txt`, `app-ads.txt`, or
`humans.txt`, the workflow opens a PR pulling the new content. Spoke CI gates the merge.

## Privacy

No prompt content ever leaves the browser. The only serverless function on the site is
`/api/og` — used for social preview images — and it only accepts title + subtitle query
strings used in the OG card itself. See [`/privacy`](app/privacy/page.tsx) for the full
policy.

## License

Source under the repo's chosen license. Pricing data is provided as-is from each
vendor's public pricing page; verify against the vendor before relying on it for
production budgeting.
