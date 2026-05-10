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

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, "..");
const OUT = resolve(ROOT, "public/llms.txt");

function buildContent(): string {
  const calculators = MODELS.map(
    (m) => `- [${m.label}](${siteConfig.url}/token-calculator/${m.slug}): tokens + USD cost`,
  ).join("\n");

  return `# ${siteConfig.name}

> ${siteConfig.description}

## Calculators

${calculators}

## Features

- [Home calculator](${siteConfig.url}/): paste a prompt, see token count + USD cost. Compare mode tokenizes against every supported model in one tap.
- [Models index](${siteConfig.url}/models): every supported model with vendor filters, sort controls, and multi-select side-by-side comparison.
- [Pricing data](${siteConfig.url}/pricing-data): every rate dated and linked to the vendor's public pricing page.
- [Changelog](${siteConfig.url}/changelog): what shipped and when.

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
