import type { MetadataRoute } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { siteConfig } from "@/lib/site-config";

interface AiBotsFile {
  allow: string[];
  disallow: string[];
}

function loadAiBots(): AiBotsFile {
  const path = join(process.cwd(), "public", "ai-bots.json");
  return JSON.parse(readFileSync(path, "utf8")) as AiBotsFile;
}

export default function robots(): MetadataRoute.Robots {
  const { allow, disallow } = loadAiBots();
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...allow.map((bot) => ({ userAgent: bot, allow: "/" })),
      ...disallow.map((bot) => ({ userAgent: bot, disallow: "/" })),
    ],
    sitemap: new URL("/sitemap.xml", siteConfig.url).toString(),
    host: siteConfig.url,
  };
}
