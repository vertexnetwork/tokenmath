import { AdSenseScript } from '@/lib/ads/adsense';
import { MediaVineScript } from '@/lib/ads/mediavine';
import { adProvider } from '@/lib/ads/provider';

/**
 * Loaded once in app/layout.tsx. The actual `<script>` tag is provider-specific and only
 * emitted when NEXT_PUBLIC_AD_PROVIDER is set + the corresponding ID env var is present.
 */
export function AdsProviderScript() {
  if (adProvider === 'adsense') return <AdSenseScript />;
  if (adProvider === 'mediavine') return <MediaVineScript />;
  return null;
}
