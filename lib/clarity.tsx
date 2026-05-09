import Script from 'next/script';

/**
 * Microsoft Clarity loader. §6.2 mandates that the project's Clarity dashboard be configured
 * to "Mask all text"; data-clarity-mask="true" is set on the prompt textarea (Calculator.tsx)
 * and cost totals (ResultCard.tsx) as a defense-in-depth measure.
 */
export function ClarityScript() {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  if (!projectId) return null;

  // Inline script that follows Clarity's documented init pattern. Loaded afterInteractive so
  // it never blocks the calculator UI.
  const init = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","${projectId}")`;

  return (
    <Script id="clarity-init" strategy="afterInteractive">
      {init}
    </Script>
  );
}
