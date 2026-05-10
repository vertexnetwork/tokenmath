import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

// Root OG fallback. Pages that want a dynamic card override metadata.openGraph.images
// (see lib/seo.ts buildMetadata). Routes that don't override get this static fallback —
// matching the shape served by /api/og but without query-string parameterization.

export const runtime = "edge";
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const { bg, onBg, accent, muted } = siteConfig.theme.colors;
  const gold = "#E5C07B";

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
          {siteConfig.tagline}
        </div>
        <div style={{ fontSize: 30, color: muted, lineHeight: 1.3 }}>{siteConfig.description}</div>
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
    size,
  );
}
