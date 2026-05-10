import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Brand monogram — bracketed cursor [|] in mark color on warm dark. The same mark renders
 * at 64×64 in /icon.svg; this 32px PNG variant is what browsers cache as the favicon.
 */
export default function Icon() {
  const { markBgColor, markColor } = siteConfig.brand;
  const onBg = siteConfig.theme.colors.onBg;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: markBgColor,
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={20} height={20} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M22 18 H18 V46 H22"
          fill="none"
          stroke={markColor}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M42 18 H46 V46 H42"
          fill="none"
          stroke={markColor}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M32 22 V42" fill="none" stroke={onBg} strokeWidth={4} strokeLinecap="round" />
      </svg>
    </div>,
    size,
  );
}
