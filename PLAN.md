# tokencount.ai — Engineering Build Spec

> **For the engineering team.** Customer-facing copy lives in §3 and is clearly labeled. Everything outside §3 is internal — do not surface it on the site.

---

## 1. Internal: Product Context

### 1.1 What it is

A client-side LLM token-and-cost estimator targeting Anthropic Claude and Google Gemini. Users paste prompts; we tokenize in-browser and multiply by per-million pricing. Zero server processing of prompt content.

### 1.2 Audience

Software developers, data scientists, AI engineers (~84% of professional developers integrate AI tools into their workflow).

### 1.3 Niche economics — INTERNAL ONLY (do not put on the site)

- Category: B2B Software / AI Development, RPM band $10–$28
- Traffic model: 4k min / 12k avg / 25k max PVs/mo
- Earnings: $40 / $192 / $700 per month
- Path to $200/mo: 12.5k PVs @ $16 RPM
- Niche score: 82/100 (Earning 89, Implementation 75)

### 1.4 Distribution — INTERNAL ONLY

HN, Dev.to, r/ClaudeAI, r/LocalLLaMA, r/MachineLearning. Programmatic SEO for long-tail per-model queries.

### 1.5 Hard constraints

- **Privacy**: no prompt content ever leaves the browser. No server route receives prompt text. Analytics may receive aggregate event names but never input content.
- **Cost ceiling**: $0/mo infra. Vercel Hobby is fine until traffic forces Pro.
- **No backend secrets**: there is intentionally no server doing AI work — therefore no API keys, no Supabase, no DB.

---

## 2. Internal: Stack & Infrastructure

### 2.1 Stack

- **Framework**: Next.js 15 (App Router), TypeScript strict mode, React 19
- **Styling**: Tailwind CSS v4
- **Fonts**: `next/font/google` for Inter + Geist Mono
- **Tokenizers** (all client-side, lazy-loaded):
  - `gpt-tokenizer` (MIT) — primary; supports `cl100k_base` and `o200k_base`; used as Claude approximation
  - `@anthropic-ai/tokenizer` — used where the older Claude vocab is closer to ground truth
  - `js-tiktoken` `o200k_base` as Gemini approximation (Google does not publish a client tokenizer)
  - Each model has a `calibrationFactor` constant (default 1.0) to nudge approximation toward Anthropic/Google reference counts
- **Lint/format**: ESLint flat config, Prettier, `tsc --noEmit` in CI
- **Tests**: Vitest (unit) + Playwright (smoke only)
- **Package manager**: pnpm

### 2.2 Hosting & domain

- **Domain**: `tokencount.ai` (apex primary, `www.` 308 redirects to apex)
- **Host**: Vercel, Hobby tier. Project name `tokencount`.
- **Edge**: all pages static or ISR. The only serverless function is `/api/og` for OG image generation, and it never receives prompt input.
- **Branch model**: `main` = production. Feature branches → preview deployments → PR → squash merge.

### 2.3 GitHub

- **Repo**: `vertex-network/tokencount` (private until launch, then public)
- **Required files**:
  - `.github/workflows/ci.yml` — runs `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` on every PR
  - `.github/CODEOWNERS` — `* @joshua-hickman`
  - `.github/PULL_REQUEST_TEMPLATE.md` — Summary / Test plan / Screenshots
  - `.github/dependabot.yml` — weekly npm + GitHub Actions updates
- **Branch protection on `main`**: require PR, require CI green, require Vercel preview success, no force-push.
- **Secrets**: none in GitHub Actions — Vercel handles deploys. All runtime config lives in Vercel env vars.

### 2.4 Vercel

- **Framework preset**: Next.js (auto-detected)
- **Node version**: 20.x
- **Build command**: `pnpm build`
- **Output**: `.next` (default)
- **Environments**: Production / Preview / Development
- **Domains**: `tokencount.ai` (apex, primary); `www.tokencount.ai` → 308 redirect to apex
- **Vercel Analytics**: enabled (Web Analytics, free tier). See §6.1.
- **Speed Insights**: enabled (free tier).
- **Git integration**: connect the GitHub repo so every PR gets an automatic preview deploy. Block merges if the Vercel build fails (set as a required status check on `main`).

### 2.5 Environment variables

All `NEXT_PUBLIC_*` are bundled to client. Set in Vercel for Production + Preview.

| Var                              | Values                             | Default | Notes                                                           |
| -------------------------------- | ---------------------------------- | ------- | --------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`           | `https://tokencount.ai`            | —       | Used by metadata, sitemap, JSON-LD                              |
| `NEXT_PUBLIC_AD_PROVIDER`        | `none` \| `adsense` \| `mediavine` | `none`  | Runtime switch for §7.1                                         |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID`  | `ca-pub-XXXXXXXXXXXXXXXX`          | —       | Set when AdSense approves                                       |
| `NEXT_PUBLIC_MEDIAVINE_SITE_ID`  | string                             | —       | Set when MediaVine approves                                     |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | string                             | —       | If unset, Clarity does not load                                 |
| `NEXT_PUBLIC_VERCEL_ANALYTICS`   | `1` \| `0`                         | `1`     | Kill-switch                                                     |
| `NEXT_PUBLIC_GA_ID`              | optional                           | —       | Off by default; available if Vercel Analytics ever insufficient |

---

## 3. Customer-facing: Brand, Copy, Visual System

> **These are the exact strings to ship on the site.** Anything from §1, §2, §4–§9 must NOT appear in user-visible text.

### 3.1 Brand

- **Name**: tokencount
- **Domain**: tokencount.ai
- **Social handle**: @tokview (reserve on X, Bluesky, GitHub org, Reddit)
- **Tagline**: "Accurate token math for Claude and Gemini. 100% client-side — your prompts never touch a server."
- **One-liner for OG**: "Paste. Count. Price. Privately."

### 3.2 Visual system

- **Theme**: dark-mode default; light-mode optional toggle
- **Palette** (Tailwind tokens in `tailwind.config.ts`):
  - `bg`: `#0A0A0B`
  - `surface`: `#15161A`
  - `border`: `#26272B`
  - `text`: `#E7E7EA`
  - `text-muted`: `#9C9CA3`
  - `accent`: `#A78BFA` (neon purple) — for cost totals
  - `accent-2`: `#34D399` (signal green) — for "in-budget" states
- **Type**:
  - UI: Inter
  - Mono (input + numeric outputs): Geist Mono
- **Spacing**: Tailwind defaults; container `max-w-[1100px]`

### 3.3 Page copy

- **H1**: "LLM Token & Cost Calculator"
- **Subhead**: "Paste a prompt. See the exact token count and API cost across Claude and Gemini. Runs entirely in your browser."
- **Privacy badge** (next to input): "Client-side. Never uploaded."
- **Empty state**: "Paste up to 1M characters of prompt, system message, or code."
- **Result labels**: "Tokens", "Input cost", "Output cost (est.)", "Total"
- **Footer disclaimer**: "Token counts are approximate (±2%) for Claude/Gemini current-gen models. Pricing reflects published rates as of {dataAsOf}."

### 3.4 Vertex Network footer link (intentionally subtle)

A single line, centered, below the main footer on every page:

> Part of the Vertex Network

Styling: `text-xs text-text-muted/60 hover:text-text-muted underline-offset-4 hover:underline`. Click opens a small modal listing sister sites:

- [Shopifont](https://shopifont.app)
- [Etsy Margin Tools](https://etsymargin.tools)
- [CaptionSnap](https://captionsnap.io)
- [KDP Cover Pro](https://kdpcover.pro)

Each link: `target="_blank" rel="noopener"` (no `nofollow` — internal network, we want the link equity).

---

## 4. Implementation: File-by-file

```
tokencount/
├─ app/
│  ├─ layout.tsx                       # root layout; fonts; theme; analytics; ads provider
│  ├─ page.tsx                         # main calculator
│  ├─ token-calculator/
│  │  └─ [model]/page.tsx              # pSEO routes — see §5
│  ├─ about/page.tsx
│  ├─ privacy/page.tsx
│  ├─ pricing-data/page.tsx            # transparency: where pricing comes from
│  ├─ api/
│  │  └─ og/route.tsx                  # OG image gen (no prompt data)
│  ├─ robots.ts                        # dynamic
│  ├─ sitemap.ts                       # dynamic; includes pSEO routes
│  ├─ manifest.ts                      # PWA manifest
│  └─ not-found.tsx
├─ public/
│  ├─ favicon.ico
│  ├─ icon.svg                         # source SVG
│  ├─ icon-192.png
│  ├─ icon-512.png
│  ├─ apple-touch-icon.png
│  ├─ ads.txt                          # static, see §7.5
│  ├─ app-ads.txt                      # static, see §7.5
│  ├─ llms.txt                         # see §7.4
│  ├─ llms-full.txt                    # generated; see §7.4
│  └─ og-default.png
├─ components/
│  ├─ Header.tsx                       # logo + nav + mobile hamburger (§4.2)
│  ├─ Footer.tsx                       # main footer + Vertex blind link (§3.4)
│  ├─ Calculator.tsx                   # textarea + results
│  ├─ ModelPicker.tsx
│  ├─ ResultCard.tsx
│  ├─ ThemeToggle.tsx
│  ├─ AdSlot.tsx                       # provider switch (§7.1)
│  └─ Analytics.tsx                    # Clarity + Vercel Analytics injector
├─ lib/
│  ├─ tokenizers/
│  │  ├─ index.ts                      # countTokens(modelId, text)
│  │  ├─ claude.ts
│  │  ├─ gemini.ts
│  │  └─ calibration.ts                # per-model factor constants
│  ├─ pricing.ts                       # MODELS[] = [{ id, label, vendor, inputUsdPerM, outputUsdPerM, contextWindow, dataAsOf }]
│  ├─ seo.ts                           # buildMetadata(), JSON-LD helpers
│  ├─ ads/
│  │  ├─ provider.ts                   # 'none'|'adsense'|'mediavine' from env
│  │  ├─ adsense.tsx
│  │  └─ mediavine.tsx
│  └─ analytics.ts
├─ content/
│  └─ models/                          # MDX per pSEO page (§5)
│     ├─ anthropic-claude-4-5-sonnet.mdx
│     ├─ anthropic-claude-4-5-haiku.mdx
│     ├─ google-gemini-2-5-pro.mdx
│     └─ ...
├─ scripts/
│  └─ build-llms-full.ts               # prebuild step that writes public/llms-full.txt
├─ tests/
│  ├─ tokenizer.test.ts                # vitest, snapshots vs reference strings
│  └─ smoke.spec.ts                    # playwright: load home, paste, see number
├─ .github/...                         # see §2.3
├─ next.config.ts                      # security headers, redirects
├─ tailwind.config.ts
├─ tsconfig.json
├─ package.json
└─ README.md
```

### 4.1 Tokenizer module — atomic spec

`lib/tokenizers/index.ts` exports:

```ts
export type ModelId =
  | 'claude-4-5-sonnet'
  | 'claude-4-5-haiku'
  | 'claude-4-7-opus'
  | 'gemini-2-5-pro'
  | 'gemini-2-5-flash';

export interface TokenCount {
  tokens: number;
  ms: number;
  source: 'gpt-tokenizer' | 'anthropic-tokenizer' | 'gemini-approx';
  approx: boolean;
}

export async function countTokens(model: ModelId, text: string): Promise<TokenCount>;
```

Implementation rules:

1. Lazy-load tokenizer libraries on first call (`await import(...)`) so the home bundle stays small.
2. Apply `calibrationFactor[model]` (from `lib/tokenizers/calibration.ts`) to the raw count.
3. Set `approx: true` for all current Claude 4.x and Gemini 2.5 models (no official tokenizer available).
4. Surface this honestly in the UI: a "±2% approx" pill next to the count with a tooltip linking to `/pricing-data`.
5. For inputs > 50,000 characters, run tokenization in a Web Worker to keep the main thread responsive.

### 4.2 Header — mobile hamburger

`components/Header.tsx`:

- **Desktop (`md:` and up)**: horizontal nav with Logo / Calculator / Models / About / GitHub
- **Mobile (<768px)**: logo left, hamburger right — `<button aria-label="Open menu" aria-expanded={open}>`
- Hamburger opens a full-height slide-in panel from the right. Use the native `<dialog>` element with `showModal()` so we get focus trap and Esc-to-close for free.
- Close on: Esc keypress, backdrop click, route change, explicit close button.
- Animated icon: 3 lines → X (CSS transform only).
- No external nav library — pure React + Tailwind + `<dialog>`.

### 4.3 Footer — Vertex blind link

`components/Footer.tsx`:

- Top row: small links — Privacy / Pricing data / GitHub / @tokview
- Bottom row (separated, lower contrast):

```tsx
<button
  onClick={() => setOpen(true)}
  className="text-xs text-text-muted/60 hover:text-text-muted underline-offset-4 hover:underline"
>
  Part of the Vertex Network
</button>
```

- Modal lists the four sister sites with their domains and a one-line descriptor each.
- All four links: `target="_blank" rel="noopener"`.

---

## 5. pSEO — Programmatic SEO routes

Goal: capture queries like "claude 4.5 sonnet token cost calculator" and "gemini 2.5 pro pricing per token".

### 5.1 Route shape

- `/token-calculator/[model]` — one statically-generated page per model.
- Params come from `lib/pricing.ts` `MODELS[]`; `generateStaticParams` returns all slugs at build time.
- Slug format: `{vendor}-{family}-{version}` (e.g. `anthropic-claude-4-5-sonnet`).

### 5.2 Per-page content (must be unique — no templated boilerplate)

Each page reads an MDX file at `content/models/{slug}.mdx` containing:

- 150-word intro: what the model is, when to use it
- The calculator preselected to that model
- Pricing table for _just this model_ with timestamps
- 3 worked examples (e.g. "5,000-token system prompt + 500-token response = $X")
- "How is this counted?" — 80 words on the tokenizer used and the approximation caveat
- FAQ block (5 Q&As) wired to FAQPage JSON-LD (§7.2)
- Cross-links to 3 sibling models

### 5.3 Acceptance

- Each page must have **≥ 600 words of unique prose** (not just the calculator UI).
- Lighthouse SEO ≥ 95.
- Each page must render with **no calls to /api or external resources at request time** — fully static.

---

## 6. Analytics

### 6.1 Vercel Analytics

- Add `@vercel/analytics` and `@vercel/speed-insights`.
- Mount `<Analytics />` and `<SpeedInsights />` in `app/layout.tsx`.
- Gated by `NEXT_PUBLIC_VERCEL_ANALYTICS=1`.
- Custom events (none receive prompt text):
  - `calc_run` — `{ model, tokenBucket: '<1k' | '1k-10k' | '10k-100k' | '100k+' }`
  - `model_changed` — `{ from, to }`
  - `vertex_footer_opened`
  - `theme_toggled` — `{ to }`

### 6.2 Microsoft Clarity

- Inject the Clarity script in `components/Analytics.tsx`, gated by `NEXT_PUBLIC_CLARITY_PROJECT_ID`.
- **Mask all prompt input**: `data-clarity-mask="true"` on the prompt `<textarea>` and on every `.result-cost` element. Cost totals can leak structure of the prompt by proxy, so we mask both.
- In the Clarity dashboard: set masking mode to "Mask all text" and unmask only specific UI chrome (titles, labels) as needed.
- Add to the privacy policy: "We use Microsoft Clarity for anonymized session replay; your prompt content and cost totals are masked before recording."

---

## 7. SEO / GEO / Compliance

### 7.1 Ad provider switch

`lib/ads/provider.ts`:

```ts
export type AdProvider = 'none' | 'adsense' | 'mediavine';
export const adProvider: AdProvider = (process.env.NEXT_PUBLIC_AD_PROVIDER ?? 'none') as AdProvider;
```

`components/AdSlot.tsx` returns `null` when `adProvider === 'none'`. Otherwise it renders the appropriate provider component. Slot placements:

- Below the result card on the home page
- Sidebar on pSEO pages (desktop only)
- Between the FAQ and the footer on pSEO pages

When `adProvider === 'adsense'`:

- `<Script src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXX" strategy="afterInteractive" crossOrigin="anonymous" />`
- Render `<ins class="adsbygoogle" ... />` and push to `adsbygoogle`

When `adProvider === 'mediavine'`:

- Mediavine wrapper script per their published install instructions
- Slots auto-injected by Mediavine — our component just renders the wrapper container

The switch from AdSense → MediaVine is a single env-var change in Vercel + redeploy. No code change.

### 7.2 GEO / structured data

`lib/seo.ts` provides JSON-LD builders:

- `WebApplication` JSON-LD on home
- `SoftwareApplication` JSON-LD on each pSEO page with `applicationCategory: "DeveloperApplication"`, `offers: { price: 0 }`
- `FAQPage` JSON-LD on every pSEO page (built from MDX frontmatter `faqs:`)
- `BreadcrumbList` on pSEO pages
- `Organization` JSON-LD in the root layout pointing to Vertex Network sites via `sameAs:`

### 7.3 Sitemap & robots

`app/sitemap.ts` returns: home, `/about`, `/privacy`, `/pricing-data`, and every `/token-calculator/[model]`. Use `lastModified` from MDX file mtime.

`app/robots.ts`:

```
User-agent: *
Allow: /
Sitemap: https://tokencount.ai/sitemap.xml
```

Explicitly allow `GPTBot`, `ClaudeBot`, `Google-Extended`, `PerplexityBot`, `CCBot` — we want to be cited by AI engines.

### 7.4 LLM discovery files

`public/llms.txt` (short index, per llmstxt.org):

```
# tokencount.ai
> Client-side LLM token counter and API cost calculator for Anthropic Claude and Google Gemini.

## Calculators
- [Claude 4.5 Sonnet](https://tokencount.ai/token-calculator/anthropic-claude-4-5-sonnet): tokens + USD cost
- [Gemini 2.5 Pro](https://tokencount.ai/token-calculator/google-gemini-2-5-pro): tokens + USD cost
...

## Reference
- [Pricing data sources](https://tokencount.ai/pricing-data)
- [Privacy policy](https://tokencount.ai/privacy)
```

`public/llms-full.txt` — long-form: full pricing tables in plain text, tokenizer notes, FAQ answers concatenated. Generated by `scripts/build-llms-full.ts` and wired to `prebuild` in `package.json` so it stays in sync with `lib/pricing.ts` + the MDX files.

### 7.5 ads.txt / app-ads.txt

`public/ads.txt`:

```
# tokencount.ai ads.txt
# Updated when ad provider changes
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

- **Until AdSense approval**: file exists with only the comment header (still 200 — avoids AdSense crawler errors).
- **When AdSense approves**: replace `pub-XXX` with the real publisher ID.
- **When MediaVine**: replace with their published `ads.txt` lines (they update frequently — pull from the MediaVine dashboard each deploy).

`public/app-ads.txt`: identical content. Covers in-app ad scenarios; future-proofing for any mobile wrapper.

### 7.6 Favicon

- Source: `public/icon.svg` — minimal monogram (bracketed `t` or token-pill mark) in accent purple `#A78BFA` on transparent.
- Generate the rest from the SVG (use `@realfavicongenerator/cli` or hand-export):
  - `favicon.ico` — multi-size 16 / 32 / 48
  - `icon-192.png`, `icon-512.png` — PWA
  - `apple-touch-icon.png` — 180×180
- Reference in `app/layout.tsx` via Next.js metadata `icons: { ... }`.
- `app/manifest.ts` exports `theme_color: '#0A0A0B'`, `background_color: '#0A0A0B'`.

### 7.7 Metadata defaults (`app/layout.tsx`)

- `metadataBase: new URL('https://tokencount.ai')`
- `title.template: '%s | tokencount'`
- `title.default: 'tokencount — LLM Token & Cost Calculator'`
- `description: 'Accurate token math for Claude and Gemini. 100% client-side.'`
- `openGraph` with `og-default.png`
- `twitter: { card: 'summary_large_image', creator: '@tokview' }`
- `alternates.canonical` set per page
- `verification`: Google Search Console + Bing Webmaster placeholders

### 7.8 Security headers (`next.config.ts`)

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy` — script allowlist:
  - Vercel: `*.vercel-insights.com`, `*.vercel-scripts.com`
  - AdSense: `*.googlesyndication.com`, `*.google.com`, `*.googleadservices.com`, `*.doubleclick.net`
  - MediaVine: `scripts.mediavine.com`
  - Clarity: `*.clarity.ms`
- `connect-src` includes the Vercel Analytics endpoint.

---

## 8. Implementation order — atomic checklist

Each line is one PR. Land in this order; each one is independently reviewable and reversible.

1. `chore: scaffold next.js 15 app with pnpm + ts-strict + tailwind v4`
2. `chore(ci): add github actions for lint/typecheck/test/build`
3. `chore: add CODEOWNERS, dependabot, PR template, branch protection notes`
4. `feat(ui): theme tokens, fonts (Inter + Geist Mono), root layout, dark default`
5. `feat(ui): Header with desktop nav + mobile hamburger drawer (a11y, focus trap)`
6. `feat(ui): Footer with Vertex Network blind link + sister-site modal`
7. `feat(lib): pricing.ts with MODELS[] + dataAsOf timestamps`
8. `feat(lib): tokenizers/{claude,gemini} + index countTokens API + Web Worker for >50k chars`
9. `feat(ui): Calculator + ModelPicker + ResultCard wired to tokenizer`
10. `feat(seo): metadata, OG default, JSON-LD helpers (WebApp + Organization)`
11. `feat(seo): app/sitemap.ts, app/robots.ts, manifest.ts, custom favicon set`
12. `feat(seo): public/llms.txt static + scripts/build-llms-full.ts wired to prebuild`
13. `feat(content): MDX pipeline + first 6 model pages under /token-calculator/[model]`
14. `feat(seo): per-page Breadcrumb + FAQPage + SoftwareApplication JSON-LD`
15. `feat(ads): provider switch (none/adsense/mediavine) + AdSlot component`
16. `feat: public/ads.txt + app-ads.txt placeholders`
17. `feat(analytics): Vercel Analytics + Speed Insights, custom events`
18. `feat(analytics): Microsoft Clarity with prompt + cost masking`
19. `feat(security): CSP + security headers in next.config.ts`
20. `feat(content): about, privacy, pricing-data pages`
21. `chore(deploy): Vercel project, env vars set, apex domain + www redirect`
22. `chore(qa): Playwright smoke + Lighthouse CI baseline`

---

## 9. Verification — engineering team runs before launch

End-to-end checks against the Vercel preview URL.

- [ ] **Functionality**: paste 5,000 chars → see a token count for each of Claude 4.5 Sonnet, Claude 4.5 Haiku, Gemini 2.5 Pro, Gemini 2.5 Flash. Numbers stable across reloads.
- [ ] **Privacy**: open DevTools → Network → paste a unique sentinel string into the textarea → confirm zero outgoing request bodies contain the sentinel. Repeat with a >100k-char prompt.
- [ ] **Mobile hamburger**: viewport 375×667 → tap hamburger → drawer opens, focus moves into drawer, Esc closes, route change closes.
- [ ] **Vertex footer**: scroll to bottom on every page → "Part of the Vertex Network" present, click → modal lists the 4 sister sites with correct URLs.
- [ ] **Ad toggle**: with `NEXT_PUBLIC_AD_PROVIDER=none` → no ad scripts in network tab. Set to `adsense` (preview env) → AdSense script loads. Set to `mediavine` → MediaVine wrapper loads.
- [ ] **SEO**:
  - `/sitemap.xml` returns 200 with all model URLs
  - `/robots.txt` allows `GPTBot`, `ClaudeBot`, `Google-Extended`, `PerplexityBot`, `CCBot`
  - `/llms.txt` and `/llms-full.txt` return 200 with the current model list
  - `/ads.txt` and `/app-ads.txt` return 200
  - View source on `/token-calculator/anthropic-claude-4-5-sonnet` → JSON-LD blocks for `SoftwareApplication`, `FAQPage`, `BreadcrumbList` parse cleanly via Google Rich Results Test
- [ ] **Analytics**:
  - Vercel Analytics dashboard receives `calc_run` events within 60s of testing
  - Clarity dashboard shows a session with the textarea masked (recording shows `***`, not pasted text)
- [ ] **Lighthouse** (mobile): Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95
- [ ] **Headers**: `curl -I https://tokencount.ai` shows HSTS, CSP, nosniff, referrer policy
- [ ] **Favicon**: `/favicon.ico`, `/icon-192.png`, `/icon-512.png`, `/apple-touch-icon.png` all 200; PWA install on Chrome shows the right icon
- [ ] **Hamburger a11y**: Axe DevTools clean; keyboard-only navigation reaches every link
- [ ] **404**: `/foo` renders the custom not-found page
- [ ] **DNS**: apex `tokencount.ai` resolves to Vercel; `www.tokencount.ai` 308s to apex

When every box is ticked → flip `NEXT_PUBLIC_AD_PROVIDER` to `adsense` (after approval) and announce.
