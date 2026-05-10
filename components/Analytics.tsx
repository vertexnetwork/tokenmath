"use client";

import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ClarityScript } from "@/lib/clarity";

const VERCEL_ENABLED = process.env.NEXT_PUBLIC_VERCEL_ANALYTICS !== "0";

/**
 * Per-vendor gating: Vercel Analytics defaults on; Clarity loads only when both
 * NEXT_PUBLIC_CLARITY_PROJECT_ID is set AND the user has accepted consent. Mounted once
 * in app/layout.tsx inside the ConsentProvider.
 */
export function Analytics() {
  return (
    <>
      {VERCEL_ENABLED && <VercelAnalytics />}
      {VERCEL_ENABLED && <SpeedInsights />}
      <ClarityScript />
    </>
  );
}
