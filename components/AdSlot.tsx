import { AdSenseSlot } from "@/lib/ads/adsense";
import { CarbonSlot } from "@/lib/ads/carbon";
import { MediaVineSlot } from "@/lib/ads/mediavine";
import { adProvider, type AdSlotPlacement } from "@/lib/ads/provider";

interface AdSlotProps {
  placement: AdSlotPlacement;
  className?: string;
}

/**
 * CLS-safe height reserve mapping (spec §10). The CSS custom properties are declared in
 * app/globals.css under @theme — keeping the reserve in CSS means the layout never shifts
 * even before the provider script fills the slot.
 */
const PLACEMENT_HEIGHT_VAR: Record<AdSlotPlacement, string> = {
  "home-below-result": "var(--ad-slot-leaderboard-h)",
  "pseo-sidebar": "var(--ad-slot-rect-h)",
  "pseo-after-faq": "var(--ad-slot-leaderboard-h)",
};

export function AdSlot({ placement, className }: AdSlotProps) {
  if (adProvider === "none") return null;

  const reservedStyle: React.CSSProperties = { minHeight: PLACEMENT_HEIGHT_VAR[placement] };
  const wrapperClass = className;

  if (adProvider === "adsense") {
    return (
      <div className={wrapperClass} data-ad-placement={placement} style={reservedStyle}>
        <AdSenseSlot placement={placement} />
      </div>
    );
  }

  if (adProvider === "mediavine") {
    return (
      <div className={wrapperClass} data-ad-placement={placement} style={reservedStyle}>
        <MediaVineSlot placement={placement} />
      </div>
    );
  }

  if (adProvider === "carbon") {
    return (
      <div className={wrapperClass} data-ad-placement={placement} style={reservedStyle}>
        <CarbonSlot placement={placement} />
      </div>
    );
  }

  return null;
}
