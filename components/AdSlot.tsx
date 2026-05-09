import { AdSenseSlot } from '@/lib/ads/adsense';
import { MediaVineSlot } from '@/lib/ads/mediavine';
import { adProvider, type AdSlotPlacement } from '@/lib/ads/provider';

interface AdSlotProps {
  placement: AdSlotPlacement;
  className?: string;
}

/**
 * Single placement primitive. Per §7.1 the provider switch is runtime via NEXT_PUBLIC_AD_PROVIDER:
 * - 'none'      → renders nothing (validation phase, no ads)
 * - 'adsense'   → renders the AdSense <ins> for the configured slot
 * - 'mediavine' → renders a MediaVine slot container; their wrapper script auto-injects
 */
export function AdSlot({ placement, className }: AdSlotProps) {
  if (adProvider === 'none') return null;

  if (adProvider === 'adsense') {
    return (
      <div className={className} data-ad-placement={placement}>
        <AdSenseSlot placement={placement} />
      </div>
    );
  }

  if (adProvider === 'mediavine') {
    return (
      <div className={className} data-ad-placement={placement}>
        <MediaVineSlot placement={placement} />
      </div>
    );
  }

  return null;
}
