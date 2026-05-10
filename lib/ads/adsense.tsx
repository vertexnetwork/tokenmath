"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import { adsenseClientId, adsenseSlots, type AdSlotPlacement } from "./provider";

interface AdSenseSlotProps {
  placement: AdSlotPlacement;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSenseScript() {
  if (!adsenseClientId) return null;
  return (
    <Script
      id="adsense-loader"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
      async
    />
  );
}

export function AdSenseSlot({ placement }: AdSenseSlotProps) {
  const slot = adsenseSlots[placement];
  const insRef = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    if (!adsenseClientId || !slot || !insRef.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // AdSense pushes can throw in dev or with ad blockers — fail closed, no UX impact.
    }
  }, [slot]);

  if (!adsenseClientId || !slot) return null;

  return (
    <ins
      ref={insRef}
      className="adsbygoogle block"
      style={{ display: "block" }}
      data-ad-client={adsenseClientId}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
