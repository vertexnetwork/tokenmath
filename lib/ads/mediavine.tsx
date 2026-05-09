'use client';

import Script from 'next/script';
import { mediavineSiteId } from './provider';

/**
 * MediaVine auto-injects ads into pages once their wrapper script loads — there are no
 * per-slot <ins> tags to render the way AdSense requires. The site-id-driven script tag is
 * loaded once globally; per-page slots are placeholder containers MediaVine fills in.
 */
export function MediaVineScript() {
  if (!mediavineSiteId) return null;
  return (
    <Script
      id="mediavine-loader"
      src={`https://scripts.mediavine.com/tags/${mediavineSiteId}.js`}
      strategy="afterInteractive"
      async
      data-noptimize="1"
      data-cfasync="false"
    />
  );
}

interface MediaVineSlotProps {
  placement: string;
}

export function MediaVineSlot({ placement }: MediaVineSlotProps) {
  if (!mediavineSiteId) return null;
  // MediaVine reads `class="mv-ad-slot"` containers and injects creatives at runtime.
  return <div className="mv-ad-slot my-6" data-placement={placement} />;
}
