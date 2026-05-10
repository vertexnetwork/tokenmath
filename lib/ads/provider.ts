export type AdProvider = "none" | "adsense" | "mediavine" | "carbon";

export const adProvider: AdProvider =
  (process.env.NEXT_PUBLIC_AD_PROVIDER as AdProvider | undefined) ?? "none";

export const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "";
export const mediavineSiteId = process.env.NEXT_PUBLIC_MEDIAVINE_SITE_ID ?? "";
export const carbonadsServeId = process.env.NEXT_PUBLIC_CARBONADS_SERVE_ID ?? "";
export const carbonadsPlacement = process.env.NEXT_PUBLIC_CARBONADS_PLACEMENT ?? "";

export type AdSlotPlacement = "home-below-result" | "pseo-sidebar" | "pseo-after-faq";

/**
 * Per-provider slot IDs. Fill in real slot IDs when each provider approves; leaving them as
 * empty strings is harmless — the slot just won't render until a real ID is set.
 *
 * In Vercel env vars these can be set per-environment (Preview vs Production).
 */
export const adsenseSlots: Record<AdSlotPlacement, string> = {
  "home-below-result": process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME ?? "",
  "pseo-sidebar": process.env.NEXT_PUBLIC_ADSENSE_SLOT_PSEO_SIDEBAR ?? "",
  "pseo-after-faq": process.env.NEXT_PUBLIC_ADSENSE_SLOT_PSEO_AFTER_FAQ ?? "",
};
