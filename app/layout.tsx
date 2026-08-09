import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { SidebarProviderWrapper } from "@/components/providers/sidebar-provider-wrapper";
import { ZoneBreadcrumb } from "@/components/zone-breadcrumb";
import {
  breadcrumbId,
  breadcrumbJsonLd,
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
  icons: {
    apple: [{ url: "/fx/apple-icon.png" }],
    icon: [{ url: "/fx/icon.svg", type: "image/svg+xml" }],
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
  manifest: "/fx/manifest.json",
  metadataBase: new URL("https://blode.co"),
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
        url: `${siteUrl}/opengraph-image.png`,
        width: 1200,
      },
      publisher: { "@id": organizationId },
      url: siteUrl,
      breadcrumb: { "@id": breadcrumbId },
    },
    breadcrumbJsonLd,
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
        {/*
          The trail lives here rather than in `page.tsx` because the studio is
          inside a Suspense boundary that never resolves during prerender, and
          everything under it is absent from the served HTML. The sidebar
          wrapper is a `flex` row, so a sibling inside it would become a column
          beside the sidebar; the strip has to sit above the whole shell.

          Its height is `--zone-trail-height`, which globals.css also uses to
          push the fixed sidebar panel down out of the way. `min-h-0 flex-1`
          overrides the wrapper's own `min-h-svh`, which would otherwise make
          the page exactly one strip taller than the viewport.

          This app serves one route, so "root page only" holds.
        */}
        <div className="flex h-(--zone-trail-height) shrink-0 items-center border-b px-4">
          <ZoneBreadcrumb product="FX" />
        </div>
        <SidebarProviderWrapper className="min-h-0 flex-1">
          {children}
        </SidebarProviderWrapper>
      </body>
    </html>
  );
}
