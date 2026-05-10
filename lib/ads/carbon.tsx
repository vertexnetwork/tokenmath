'use client';

import Script from 'next/script';
import { carbonadsPlacement, carbonadsServeId } from './provider';
import type { AdSlotPlacement } from './provider';

/**
 * Carbon Ads embeds a self-contained `<script>` at the placement location and the script
 * itself renders the ad inline — there is no separate global loader the way AdSense and
 * MediaVine require. Returning null from the global hook keeps that contract honest.
 */
export function CarbonScript() {
  return null;
}

interface CarbonSlotProps {
  placement: AdSlotPlacement;
}

export function CarbonSlot({ placement }: CarbonSlotProps) {
  if (!carbonadsServeId || !carbonadsPlacement) return null;
  // Each slot loads a fresh script tag; the id includes the placement so Next/Script's
  // dedupe doesn't collapse multiple Carbon ads on the same page.
  return (
    <Script
      id={`carbonads-${placement}`}
      src={`https://cdn.carbonads.com/carbon.js?serve=${carbonadsServeId}&placement=${carbonadsPlacement}`}
      strategy="afterInteractive"
      async
    />
  );
}
