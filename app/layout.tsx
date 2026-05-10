import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono, Source_Serif_4 } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdsProviderScript } from "@/components/AdsProviderScript";
import { Analytics } from "@/components/Analytics";
import { KeyboardHelp } from "@/components/KeyboardHelp";
import { ConsentProvider } from "@/components/consent/ConsentProvider";
import { CookieConsent } from "@/components/consent/CookieConsent";
import { SiteSchema } from "@/components/seo/SiteSchema";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Source Serif 4 is the editorial accent — used for serif emphasis on About / Changelog
// and a few editorial headings. Loaded with display:swap so it doesn't block FCP.
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — LLM Token & Cost Calculator`,
    template: `%s | ${siteConfig.name}`,
  },
  keywords: [...siteConfig.keywords],
  ...buildMetadata(),
  verification: {
    google: siteConfig.verification.google,
    other: {
      "msvalidate.01": siteConfig.verification.bing ?? "",
    },
  },
};

export const viewport: Viewport = {
  themeColor: siteConfig.theme.colors.bg,
  colorScheme: "dark light",
};

// Runs before React hydrates to set html.{dark|light} from localStorage and avoid a flash
// of the wrong theme. Dark is the brand default — system `prefers-color-scheme` is ignored;
// a user lands on light only if they explicitly toggled and we persisted that choice.
const THEME_BOOT_SCRIPT = `(function(){try{var s=localStorage.getItem('theme');var t=s==='light'?'light':'dark';var c=document.documentElement.classList;c.toggle('dark',t==='dark');c.toggle('light',t==='light');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${geistMono.variable} ${sourceSerif.variable} h-full antialiased`}
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
        <ConsentProvider>
          <Header />
          {children}
          <Footer />
          <KeyboardHelp />
          <AdsProviderScript />
          <Analytics />
          <CookieConsent />
        </ConsentProvider>
        <SiteSchema />
      </body>
    </html>
  );
}
