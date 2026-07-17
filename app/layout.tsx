import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata, Viewport } from "next";

import { CraftedBy } from "@/components/crafted-by";
import { SidebarProviderWrapper } from "@/components/providers/sidebar-provider-wrapper";

import "./globals.css";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FX",
  },
  authors: [{ name: "Matthew Blode", url: "https://matthewblode.com" }],
  category: "technology",
  creator: "Matthew Blode",
  description:
    "Turn images and video into blue noise dithering, ASCII art, or an LED dot matrix. Free, fast, client-side — nothing leaves your browser.",
  icons: {
    apple: [{ url: "/apple-icon.png" }],
    icon: [{ url: "/favicon.ico" }, { url: "/icon1.png", type: "image/png" }],
  },
  keywords: [
    "blue noise",
    "dithering",
    "ascii art",
    "image to ascii",
    "ascii converter",
    "led matrix",
    "image processing",
    "image converter",
    "halftone",
    "ordered dithering",
    "online image processor",
    "blue noise algorithm",
    "video to ascii",
    "dither video",
    "ascii art video",
  ],
  manifest: "/manifest.json",
  metadataBase: new URL("https://fx.blode.co"),
  openGraph: {
    description:
      "Turn images and video into blue noise dithering, ASCII art, or an LED dot matrix. Free, fast, client-side — nothing leaves your browser.",
    locale: "en_US",
    siteName: "FX",
    title: "FX — Dither, ASCII & LED for Images & Video",
    type: "website",
    url: "https://fx.blode.co",
  },
  publisher: "Matthew Blode",
  robots: {
    follow: true,
    googleBot: {
      follow: true,
      index: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    index: true,
  },
  title: "FX — Dither, ASCII & LED for Images & Video",
  twitter: {
    card: "summary_large_image",
    creator: "@mattblode",
    description:
      "Turn images and video into blue noise dithering, ASCII art, or an LED dot matrix. Free, fast, client-side — nothing leaves your browser.",
    title: "FX — Dither, ASCII & LED for Images & Video",
  },
  verification: {
    google: "mFwyBIbXTaKK4uF_NA0MzVWFyY40hPgBjFObg3rje04",
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "oklch(1 0 0)" },
    { media: "(prefers-color-scheme: dark)", color: "oklch(0.145 0 0)" },
  ],
  width: "device-width",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  alternateName: "FX — Image & Video Effects",
  applicationCategory: "MultimediaApplication",
  author: {
    "@type": "Person",
    email: "m@blode.co",
    name: "Matthew Blode",
  },
  browserRequirements:
    "Requires JavaScript. Modern browser with Canvas API support.",
  dateModified: "2026-07-17",
  datePublished: "2026-01-14",
  description:
    "Turn images and video into blue noise dithering, ASCII art, or an LED dot matrix. Free, fast, client-side — nothing leaves your browser.",
  featureList: [
    "Blue noise dithering",
    "ASCII art rendering",
    "LED dot-matrix rendering",
    "Real-time preview",
    "Client-side processing",
    "Brightness adjustment",
    "Contrast adjustment",
    "Custom color selection",
    "Image resize options",
    "Video processing",
    "MP4 export with audio",
  ],
  name: "FX",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  operatingSystem: "Web Browser",
  screenshot: "https://fx.blode.co/opengraph-image.png",
  url: "https://fx.blode.co",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="h-full" lang="en" style={{ colorScheme: "light dark" }}>
      <head>
        <meta content="FX" name="apple-mobile-web-app-title" />
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Static Schema.org structured data
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          type="application/ld+json"
        />
      </head>
      <body className="h-full antialiased">
        <GoogleAnalytics gaId="G-61F273Q9JP" />
        <SidebarProviderWrapper>{children}</SidebarProviderWrapper>
        <footer className="pointer-events-none fixed right-3 bottom-3 z-10 flex justify-end">
          <span className="pointer-events-auto">
            <CraftedBy />
          </span>
        </footer>
      </body>
    </html>
  );
}
