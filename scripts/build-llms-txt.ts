/**
 * Generates public/llms.txt — the concise machine-readable site index for AI crawlers.
 * Long-form pricing tables + per-model details live in llms-full.txt (separate script).
 *
 * Source of truth: lib/site-config.ts (URL + name + description) and lib/pricing.ts
 * (model catalog). Wired to `prebuild` so the file stays fresh on every build.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { siteConfig } from "../lib/site-config";
import { MODELS } from "../lib/pricing";
import { PLATFORMS } from "../lib/platforms";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, "..");
const OUT = resolve(ROOT, "public/llms.txt");

function buildContent(): string {
  const calculators = MODELS.map(
    (m) => `- [${m.label}](${siteConfig.url}/token-calculator/${m.slug}): tokens + USD cost`,
  ).join("\n");

  const platforms = PLATFORMS.map(
    (p) => `- [${p.name}](${siteConfig.url}/cost/${p.slug}): ${p.tagline}`,
  ).join("\n");

  const platformsSection =
    PLATFORMS.length > 0
      ? `
## Platform costs

How popular AI coding tools bill, and how their credits/tokens map to real model cost.

${platforms}
`
      : "";

  return `# ${siteConfig.name}

> ${siteConfig.description}

## Calculators

${calculators}

## Features

- [Home calculator](${siteConfig.url}/): paste a prompt, see token count + USD cost. Compare mode tokenizes against every supported model in one tap.
- [Models index](${siteConfig.url}/models): every supported model with vendor filters, sort controls, and multi-select side-by-side comparison.
- [Compare models](${siteConfig.url}/compare): side-by-side cost comparison for any two models — input/output price, context window, accuracy, and what a real request costs on each.
- [Platform costs](${siteConfig.url}/cost): how AI coding tools (Cursor, Replit, Copilot, …) bill, and how their credits/tokens map to real model cost.
- [Pricing data](${siteConfig.url}/pricing-data): every rate dated and linked to the vendor's public pricing page.
- [Changelog](${siteConfig.url}/changelog): what shipped and when.
${platformsSection}
## Reference

- [Privacy policy](${siteConfig.url}/privacy)
- [Terms](${siteConfig.url}/terms)
- [About](${siteConfig.url}/about)
- [Contact](${siteConfig.url}/contact)
- [Vertex Network](${siteConfig.url}/network)
- [Full reference (machine-readable)](${siteConfig.url}/llms-full.txt)
`;
}

async function main(): Promise<void> {
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, buildContent(), "utf8");
  console.log(`✓ wrote ${OUT}`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
