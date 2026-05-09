import type { NextConfig } from 'next';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import createMDX from '@next/mdx';

const here = dirname(fileURLToPath(import.meta.url));

// Plugins are passed by name (strings) so Turbopack can serialize the loader options.
// Importing the plugin functions directly works with Webpack but breaks Turbopack builds.
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: ['remark-frontmatter', ['remark-mdx-frontmatter', { name: 'frontmatter' }]],
  },
});

// §7.8 — Content Security Policy. The script + connect allowlist is provider-aware.
// 'unsafe-inline' is regrettable but currently required for Next 16 static-page hydration
// (no nonce path exists for SSG). Reassess when Next ships a static-friendly nonce.
const SCRIPT_SOURCES = [
  "'self'",
  "'unsafe-inline'",
  "'unsafe-eval'",
  'https://*.vercel-insights.com',
  'https://*.vercel-scripts.com',
  'https://*.googlesyndication.com',
  'https://*.google.com',
  'https://*.googleadservices.com',
  'https://*.doubleclick.net',
  'https://scripts.mediavine.com',
  'https://*.clarity.ms',
];

const CONNECT_SOURCES = [
  "'self'",
  'https://*.vercel-insights.com',
  'https://*.vercel-scripts.com',
  'https://*.clarity.ms',
  'https://*.google.com',
  'https://*.doubleclick.net',
  'https://*.googlesyndication.com',
];

const IMG_SOURCES = [
  "'self'",
  'data:',
  'blob:',
  'https://*.googlesyndication.com',
  'https://*.google.com',
  'https://*.doubleclick.net',
  'https://*.clarity.ms',
];

const STYLE_SOURCES = ["'self'", "'unsafe-inline'"];

const FRAME_SOURCES = ["'self'", 'https://*.googlesyndication.com', 'https://*.doubleclick.net'];

const CSP = [
  `default-src 'self'`,
  `script-src ${SCRIPT_SOURCES.join(' ')}`,
  `connect-src ${CONNECT_SOURCES.join(' ')}`,
  `img-src ${IMG_SOURCES.join(' ')}`,
  `style-src ${STYLE_SOURCES.join(' ')}`,
  `font-src 'self' data:`,
  `frame-src ${FRAME_SOURCES.join(' ')}`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
].join('; ');

const SECURITY_HEADERS = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  { key: 'Content-Security-Policy', value: CSP },
];

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  turbopack: {
    root: here,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: SECURITY_HEADERS,
      },
    ];
  },
  async redirects() {
    // Apex is canonical; www → apex via 308. Vercel honors this once both domains are bound
    // to the project. (§2.4 — domain config.)
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.tokencount.ai' }],
        destination: 'https://tokencount.ai/:path*',
        permanent: true,
      },
    ];
  },
};

export default withMDX(nextConfig);
