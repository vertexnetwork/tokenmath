/**
 * Content-Security-Policy builder. The script + connect allowlist is provider-aware so
 * spokes that don't enable Mediavine, Carbon, etc. don't ship the union allowlist.
 *
 * 'unsafe-inline' on script-src is regrettable but currently required for Next 16
 * static-page hydration; no nonce path exists for SSG. Reassess when Next ships a
 * static-friendly nonce.
 */

export interface CspProviders {
  vercelAnalytics?: boolean;
  adsense?: boolean;
  mediavine?: boolean;
  carbon?: boolean;
  clarity?: boolean;
  plausible?: boolean;
  embed?: boolean;
}

const VERCEL_HOSTS = ["https://*.vercel-insights.com", "https://*.vercel-scripts.com"];
const CLARITY_HOSTS = ["https://*.clarity.ms"];
const PLAUSIBLE_HOSTS = ["https://plausible.io"];
const ADSENSE_HOSTS = [
  "https://*.googlesyndication.com",
  "https://*.google.com",
  "https://*.googleadservices.com",
  "https://*.doubleclick.net",
];
const MEDIAVINE_HOSTS = ["https://scripts.mediavine.com"];
const CARBON_HOSTS = ["https://cdn.carbonads.com", "https://srv.carbonads.net"];

export function buildCSP(providers: CspProviders = {}): string {
  const script = ["'self'", "'unsafe-inline'", "'unsafe-eval'"];
  const connect = ["'self'"];
  const img = ["'self'", "data:", "blob:"];
  const style = ["'self'", "'unsafe-inline'"];
  const font = ["'self'", "data:"];
  const frame = ["'self'"];

  if (providers.vercelAnalytics) {
    script.push(...VERCEL_HOSTS);
    connect.push(...VERCEL_HOSTS);
  }
  if (providers.clarity) {
    script.push(...CLARITY_HOSTS);
    connect.push(...CLARITY_HOSTS);
    img.push(...CLARITY_HOSTS);
  }
  if (providers.plausible) {
    script.push(...PLAUSIBLE_HOSTS);
    connect.push(...PLAUSIBLE_HOSTS);
  }
  if (providers.adsense) {
    script.push(...ADSENSE_HOSTS);
    connect.push(...ADSENSE_HOSTS);
    img.push(...ADSENSE_HOSTS);
    frame.push(...ADSENSE_HOSTS);
  }
  if (providers.mediavine) {
    script.push(...MEDIAVINE_HOSTS);
  }
  if (providers.carbon) {
    script.push(...CARBON_HOSTS);
    connect.push(...CARBON_HOSTS);
    img.push(...CARBON_HOSTS);
  }

  return [
    `default-src 'self'`,
    `script-src ${script.join(" ")}`,
    `connect-src ${connect.join(" ")}`,
    `img-src ${img.join(" ")}`,
    `style-src ${style.join(" ")}`,
    `font-src ${font.join(" ")}`,
    `frame-src ${frame.join(" ")}`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    // /embed/* needs frame-ancestors *; vercel.json applies that override per-route.
    providers.embed ? `frame-ancestors *` : `frame-ancestors 'none'`,
  ].join("; ");
}
