import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const runtime = "edge";

const SIZE = { width: 1200, height: 630 };

/**
 * /api/og — OG image generator. Per §1.5 and §2.4 this route NEVER receives prompt input;
 * accepted query params are limited to title + subtitle text used in the OG card itself.
 *
 * Theme color literals are sourced from siteConfig.theme.colors; the Edge runtime can't
 * import CSS, so the JS surface in lib/site-config.ts is the source of truth for per-site
 * brand color overrides.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const title = clamp(url.searchParams.get("title") ?? "LLM Token & Cost Calculator", 80);
  const subtitle = clamp(
    url.searchParams.get("subtitle") ?? "Paste. Count. Price. Privately.",
    140,
  );
  const stat = url.searchParams.get("stat"); // e.g. "$3 / $15 per 1M" — optional

  const { bg, onBg, accent, muted } = siteConfig.theme.colors;
  const gold = "#E5C07B"; // brand-specific accent — not a network token

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        background: bg,
        color: onBg,
        padding: "72px 80px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 32 }}>
        <span style={{ color: accent, fontFamily: "monospace", fontWeight: 500 }}>[</span>
        <span style={{ fontWeight: 600, letterSpacing: "-0.02em" }}>{siteConfig.name}</span>
        <span style={{ color: accent, fontFamily: "monospace", fontWeight: 500 }}>]</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div
          style={{
            fontSize: 84,
            fontWeight: 600,
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 30, color: muted, lineHeight: 1.3 }}>{subtitle}</div>
        {stat && (
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 26,
              color: gold,
              letterSpacing: "-0.01em",
            }}
          >
            {stat}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 22,
          color: muted,
        }}
      >
        <span>{siteConfig.domain}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 10, color: gold }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: gold,
              display: "block",
            }}
          />
          <span>Client-side. Never uploaded.</span>
        </span>
      </div>
    </div>,
    SIZE,
  );
}

function clamp(s: string, max: number) {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1).trimEnd()}…`;
}
