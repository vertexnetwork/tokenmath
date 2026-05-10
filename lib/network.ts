/**
 * Hub-synced sister-site registry. Reads public/network.json (the synced copy of the hub's
 * canonical config/network.json) and exposes typed accessors for the /network page,
 * Footer, and Organization JSON-LD.
 *
 * The data file is read at build time via fs.readFileSync so callers can stay synchronous;
 * the JSON is small and re-reading it has no measurable cost on a static build.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

export type NetworkProperty = {
  slug: string;
  name: string;
  domain: string;
  url: string;
  tagline: string;
  description: string;
  audience: string;
  tags: string[];
  status: "live" | "soon";
};

interface NetworkFile {
  version: string;
  brand: string;
  sites: NetworkProperty[];
}

let cached: NetworkFile | null = null;

function load(): NetworkFile {
  if (cached) return cached;
  const path = join(process.cwd(), "public", "network.json");
  cached = JSON.parse(readFileSync(path, "utf8")) as NetworkFile;
  return cached;
}

export function loadNetwork(): NetworkFile {
  return load();
}

export function listSiblings(currentUrl: string): NetworkProperty[] {
  const normalized = currentUrl.replace(/\/+$/, "");
  return load().sites.filter((site) => site.url.replace(/\/+$/, "") !== normalized);
}

export function listAll(): NetworkProperty[] {
  return load().sites;
}
