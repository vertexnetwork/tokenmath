import type { Metadata, Viewport } from 'next';
import { Inter, Geist_Mono } from 'next/font/google';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdsProviderScript } from '@/components/AdsProviderScript';
import { Analytics } from '@/components/Analytics';
import { buildMetadata, organizationJsonLd, renderJsonLd, SITE_URL } from '@/lib/seo';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'tokencount — LLM Token & Cost Calculator',
    template: '%s | tokencount',
  },
  ...buildMetadata(),
  // Search-engine verification placeholders — fill in after first deploy.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ?? '',
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0B',
  colorScheme: 'dark light',
};

// Runs before React hydrates to set html.{dark|light} from localStorage (or system preference)
// and avoid a flash of the wrong theme. Kept inline + minified manually so it's small.
const THEME_BOOT_SCRIPT = `(function(){try{var s=localStorage.getItem('theme');var t=s==='light'||s==='dark'?s:(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');var c=document.documentElement.classList;c.toggle('dark',t==='dark');c.toggle('light',t==='light');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-(--accent) px-3 py-2 text-sm font-medium text-(--bg) focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
        >
          Skip to main content
        </a>
        <Header />
        {children}
        <Footer />
        <AdsProviderScript />
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={renderJsonLd(organizationJsonLd())}
        />
      </body>
    </html>
  );
}
