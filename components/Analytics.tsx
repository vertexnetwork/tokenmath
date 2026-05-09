import { Analytics as VercelAnalytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const ENABLED = process.env.NEXT_PUBLIC_VERCEL_ANALYTICS !== '0';

/**
 * Vercel Analytics + Speed Insights, gated by NEXT_PUBLIC_VERCEL_ANALYTICS (default 1).
 * Microsoft Clarity is mounted in the same component slot but lives in lib/clarity.tsx (PR #18)
 * to keep the gating logic per-vendor.
 */
export function Analytics() {
  if (!ENABLED) return null;
  return (
    <>
      <VercelAnalytics />
      <SpeedInsights />
    </>
  );
}
