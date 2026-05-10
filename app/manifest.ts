import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'tokencount',
    short_name: 'tokencount',
    description: 'Accurate token math for Claude, Gemini, and OpenAI. 100% client-side.',
    start_url: '/',
    display: 'standalone',
    theme_color: '#0A0A0B',
    background_color: '#0A0A0B',
    icons: [
      // /icon.svg is the canonical scalable mark; modern PWA installers accept it.
      // App-managed PNG variants are emitted by app/icon.tsx + app/apple-icon.tsx.
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  };
}
