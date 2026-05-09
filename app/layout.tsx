import type { Metadata, Viewport } from 'next';
import { Inter, Geist_Mono } from 'next/font/google';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdsProviderScript } from '@/components/AdsProviderScript';
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
      <body className="flex min-h-full flex-col">
        <Header />
        {children}
        <Footer />
        <AdsProviderScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={renderJsonLd(organizationJsonLd())}
        />
      </body>
    </html>
  );
}
