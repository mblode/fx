import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { SidebarProviderWrapper } from "@/components/providers/sidebar-provider-wrapper";
import {
  webPageId,
  ogSiteName,
  organizationId,
  personId,
  siteDescription,
  siteName,
  siteTitle,
  siteUrl,
  websiteId,
} from "@/lib/site";

import "./globals.css";

const glide = localFont({
  src: [
    { path: "./fonts/glide-variable.woff2", style: "normal" },
    { path: "./fonts/glide-variable-italic.woff2", style: "italic" },
  ],
  variable: "--font-glide",
  weight: "100 950",
  display: "swap",
});

const glideMono = localFont({
  src: "./fonts/glide-mono.woff2",
  variable: "--font-glide-mono",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  alternates: {
    canonical: siteUrl,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FX",
  },
  authors: [{ name: "Matthew Blode", url: "https://blode.co" }],
  category: "technology",
  creator: "Matthew Blode",
  description: siteDescription,
  // Paths without `/fx`: `metadataBase` already carries the zone, and Next
  // joins rather than replaces, so spelling the prefix here would double it.
  icons: {
    apple: [{ url: "/apple-icon.png" }],
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
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
  // The zone URL, not the bare origin (Rule 11). Only correct because the card
  // is a generated `opengraph-image.tsx` route: Next does not prefix those with
  // `basePath`, so `metadataBase` supplies the prefix exactly once. Against the
  // static PNG this replaced, the two would have stacked into `/fx/fx/…`.
  metadataBase: new URL(siteUrl),
  // No `images` here: `app/opengraph-image.tsx` is the card. Next reuses it for
  // `twitter:image` too when there is no `twitter-image` file.
  openGraph: {
    description: siteDescription,
    locale: "en_US",
    siteName: ogSiteName,
    title: siteTitle,
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
  // Inner pages inherit the template; the app ships one route today, but a flat
  // string means anything added later has no title pattern to fall into.
  title: {
    default: siteTitle,
    template: `%s | ${siteName}`,
  },
  twitter: {
    card: "summary_large_image",
    creator: "@mattblode",
    description: siteDescription,
    title: siteTitle,
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
    /*
     * A WebPage, not a WebApplication. WebApplication is a SoftwareApplication
     * subtype, so validators hold it to Google's Software App rich result, which
     * requires aggregateRating or review. The only ratings available to us are
     * ones we would write about our own tool, and Google's review policy
     * forbids exactly that, so the node could never pass as typed.
     *
     * The capability list survives as `keywords`, which is valid here and is
     * what AI crawlers read anyway. `browserRequirements` and
     * `applicationCategory` do not exist outside SoftwareApplication and are
     * dropped rather than misapplied.
     */
    {
      "@id": webPageId,
      "@type": "WebPage",
      alternateName: "FX: image and video effects",
      author: { "@id": personId },
      dateModified: "2026-07-17",
      datePublished: "2026-01-14",
      description: siteDescription,
      inLanguage: "en",
      isPartOf: { "@id": websiteId },
      keywords: [
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
      name: siteName,
      offers: {
        "@type": "Offer",
        category: "Free",
        price: "0",
        priceCurrency: "USD",
      },
      // primaryImageOfPage ranges over ImageObject. A bare URL string is a
      // literal, not a node reference, so it fails schema.org validation.
      primaryImageOfPage: {
        "@type": "ImageObject",
        height: 630,
        url: `${siteUrl}/opengraph-image`,
        width: 1200,
      },
      publisher: { "@id": organizationId },
      url: siteUrl,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`h-full ${glide.variable} ${glideMono.variable}`}
      lang="en"
      style={{ colorScheme: "light dark" }}
    >
      <head>
        <meta content="FX" name="apple-mobile-web-app-title" />
        <link href={process.env.NEXT_PUBLIC_POSTHOG_HOST} rel="preconnect" />
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Static Schema.org structured data
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          type="application/ld+json"
        />
      </head>
      <body className="flex h-full flex-col antialiased">
        <SidebarProviderWrapper>{children}</SidebarProviderWrapper>
      </body>
    </html>
  );
}
