"use client";

import Script from "next/script";
import { useConsent } from "@/components/consent/ConsentProvider";

/**
 * Microsoft Clarity loader. Spec §9 mandates the script loads only when consent is granted.
 * Defense-in-depth: data-clarity-mask="true" is set on the prompt textarea (Calculator.tsx)
 * and cost totals (ResultCard.tsx) so even within consenting sessions prompt content is
 * masked.
 */
export function ClarityScript() {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  const { state } = useConsent();
  if (!projectId) return null;
  if (state !== "granted") return null;

  // Inline script that follows Clarity's documented init pattern. Loaded afterInteractive so
  // it never blocks the calculator UI.
  const init = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","${projectId}")`;

  return (
    <Script id="clarity-init" strategy="afterInteractive">
      {init}
    </Script>
  );
}
