import { AdSenseScript } from "@/lib/ads/adsense";
import { CarbonScript } from "@/lib/ads/carbon";
import { MediaVineScript } from "@/lib/ads/mediavine";
import { adProvider } from "@/lib/ads/provider";

/**
 * Loaded once in app/layout.tsx. The actual `<script>` tag is provider-specific and only
 * emitted when NEXT_PUBLIC_AD_PROVIDER is set + the corresponding ID env var is present.
 *
 * Carbon Ads has no global loader — each slot embeds its own self-contained script — so
 * CarbonScript() returns null intentionally.
 */
export function AdsProviderScript() {
  if (adProvider === "adsense") return <AdSenseScript />;
  if (adProvider === "mediavine") return <MediaVineScript />;
  if (adProvider === "carbon") return <CarbonScript />;
  return null;
}
