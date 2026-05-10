/**
 * Generates the multi-size favicon set from public/icon.svg using sharp.
 *
 * Outputs:
 *   public/favicon.ico                (32×32)
 *   public/favicon-16.png
 *   public/favicon-32.png
 *   public/icon-192.png
 *   public/icon-512.png
 *   public/apple-touch-icon-180.png
 *
 * Wired to `prebuild` so favicons stay in sync with public/icon.svg automatically.
 * Falls back to a no-op if sharp isn't installed (so a fresh clone without `pnpm install`
 * doesn't fail the build before the user has a chance to install deps).
 */

import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, "..");
const SRC = resolve(ROOT, "public/icon.svg");

interface Sharp {
  resize: (w: number, h: number) => Sharp;
  png: () => Sharp;
  toFile: (path: string) => Promise<unknown>;
  toBuffer: () => Promise<Buffer>;
}
type SharpFactory = (input: string | Buffer) => Sharp;

async function loadSharp(): Promise<SharpFactory | null> {
  try {
    const mod = (await import("sharp")) as unknown as { default: SharpFactory };
    return mod.default;
  } catch {
    return null;
  }
}

const TARGETS: Array<{ name: string; size: number }> = [
  { name: "favicon-16.png", size: 16 },
  { name: "favicon-32.png", size: 32 },
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon-180.png", size: 180 },
];

async function main(): Promise<void> {
  if (!existsSync(SRC)) {
    console.warn(`✗ ${SRC} missing — skipping favicon generation`);
    return;
  }
  const sharp = await loadSharp();
  if (!sharp) {
    console.warn("✗ sharp not installed — skipping favicon generation. Run `pnpm add -D sharp`.");
    return;
  }

  for (const target of TARGETS) {
    const out = resolve(ROOT, "public", target.name);
    await sharp(SRC).resize(target.size, target.size).png().toFile(out);
    console.log(`✓ ${out}`);
  }

  // .ico is just a 32×32 PNG with the .ico extension — works in all modern browsers and
  // most legacy ones. Avoids pulling in an extra ico-encoder dep.
  const icoBuf = await sharp(SRC).resize(32, 32).png().toBuffer();
  const icoPath = resolve(ROOT, "public/favicon.ico");
  await writeFile(icoPath, icoBuf);
  console.log(`✓ ${icoPath}`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
