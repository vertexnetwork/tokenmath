import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Apple touch icon — the same monogram at 180×180 with extra padding so iOS's automatic
 * radius doesn't clip the brackets.
 */
export default function AppleIcon() {
  const { markBgColor, markColor } = siteConfig.brand;
  const onBg = siteConfig.theme.colors.onBg;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: markBgColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={120} height={120} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M22 18 H18 V46 H22"
          fill="none"
          stroke={markColor}
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M42 18 H46 V46 H42"
          fill="none"
          stroke={markColor}
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M32 22 V42" fill="none" stroke={onBg} strokeWidth={3.5} strokeLinecap="round" />
      </svg>
    </div>,
    size,
  );
}
