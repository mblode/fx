import type { Metadata, Viewport } from "next";
import { preload } from "react-dom";

import { Analytics } from "@/components/analytics";
import { SidebarProviderWrapper } from "@/components/providers/sidebar-provider-wrapper";
import {
  applicationId,
  organizationId,
  personId,
  siteDescription,
  siteName,
  siteUrl,
  websiteId,
} from "@/lib/site";

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
  description: siteDescription,
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
  metadataBase: new URL(siteUrl),
  openGraph: {
    description: siteDescription,
    locale: "en_US",
    siteName,
    title: "FX — Dither, ASCII & LED for Images & Video",
    type: "website",
    url: siteUrl,
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
    description: siteDescription,
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

// One @graph, each entity defined once with a stable @id and referenced by @id
// elsewhere, so crawlers resolve a single connected graph rather than repeated
// disconnected snippets.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@id": personId,
      "@type": "Person",
      email: "m@blode.co",
      name: "Matthew Blode",
      sameAs: ["https://matthewblode.com", "https://github.com/mblode"],
      url: "https://matthewblode.com",
    },
    {
      "@id": organizationId,
      "@type": "Organization",
      founder: { "@id": personId },
      logo: {
        "@type": "ImageObject",
        height: 512,
        url: `${siteUrl}/web-app-manifest-512x512.png`,
        width: 512,
      },
      name: siteName,
      url: siteUrl,
    },
    {
      "@id": websiteId,
      "@type": "WebSite",
      description: siteDescription,
      inLanguage: "en",
      name: siteName,
      publisher: { "@id": organizationId },
      url: siteUrl,
    },
    {
      "@id": applicationId,
      "@type": "WebApplication",
      alternateName: "FX — Image & Video Effects",
      applicationCategory: "MultimediaApplication",
      author: { "@id": personId },
      browserRequirements:
        "Requires JavaScript. Modern browser with Canvas API support.",
      dateModified: "2026-07-17",
      datePublished: "2026-01-14",
      description: siteDescription,
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
      inLanguage: "en",
      isPartOf: { "@id": websiteId },
      name: siteName,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      operatingSystem: "Web Browser",
      publisher: { "@id": organizationId },
      screenshot: `${siteUrl}/opengraph-image.png`,
      url: siteUrl,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The @font-face lives in globals.css, so the browser only discovers the file
  // after the stylesheet parses. Preloading starts it during HTML parse instead.
  // crossOrigin is required even same-origin: fonts fetch in CORS mode, and
  // without it the preload misses and the font is fetched twice.
  preload("/fonts/PPNeueMontreal-Variable.woff2", {
    as: "font",
    crossOrigin: "anonymous",
    type: "font/woff2",
  });

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
        <Analytics gaId="G-61F273Q9JP" />
        <SidebarProviderWrapper>{children}</SidebarProviderWrapper>
      </body>
    </html>
  );
}
