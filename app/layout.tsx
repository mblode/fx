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
    title: "Blue noise",
  },
  authors: [{ name: "Matthew Blode", url: "https://matthewblode.com" }],
  category: "technology",
  creator: "Matthew Blode",
  description:
    "Apply professional blue noise dithering to your images online. Free, fast, client-side image processing tool with real-time preview. Convert images to artistic halftone patterns.",
  icons: {
    apple: [{ url: "/apple-icon.png" }],
    icon: [{ url: "/favicon.ico" }, { url: "/icon1.png", type: "image/png" }],
  },
  keywords: [
    "blue noise",
    "dithering",
    "image processing",
    "image converter",
    "halftone",
    "stippling",
    "ordered dithering",
    "image dither tool",
    "online image processor",
    "blue noise algorithm",
  ],
  manifest: "/manifest.json",
  metadataBase: new URL("https://blue-noise.blode.co"),
  openGraph: {
    description:
      "Apply professional blue noise dithering to your images online. Free, fast, and client-side image processing tool with real-time preview.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Blue Noise Dither - Image Processing Tool",
      },
    ],
    locale: "en_US",
    siteName: "Blue Noise Dither",
    title: "Blue Noise Dither - High-Quality Image Dithering Tool",
    type: "website",
    url: "https://blue-noise.blode.co",
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
  title: "Blue Noise Dither - High-Quality Image Dithering Tool",
  twitter: {
    card: "summary_large_image",
    creator: "@mattblode",
    description:
      "Apply professional blue noise dithering to your images online. Free, fast, client-side processing.",
    images: ["/og-image.png"],
    title: "Blue Noise Dither - High-Quality Image Dithering Tool",
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
  alternateName: "Blue Noise Image Dithering Tool",
  applicationCategory: "MultimediaApplication",
  author: {
    "@type": "Person",
    email: "m@blode.co",
    name: "Matthew Blode",
  },
  browserRequirements:
    "Requires JavaScript. Modern browser with Canvas API support.",
  dateModified: "2026-01-14",
  datePublished: "2026-01-14",
  description:
    "Professional blue noise dithering application for high-quality image processing. Apply ordered dithering with real-time preview.",
  featureList: [
    "Blue noise dithering",
    "Real-time preview",
    "Client-side processing",
    "Multiple noise texture sizes",
    "Brightness adjustment",
    "Contrast adjustment",
    "Custom color selection",
    "Image resize options",
  ],
  name: "Blue Noise Dither",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  operatingSystem: "Web Browser",
  screenshot: "https://blue-noise.blode.co/og-image.png",
  url: "https://blue-noise.blode.co",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="h-full" lang="en" style={{ colorScheme: "light dark" }}>
      <head>
        <meta content="Blue noise" name="apple-mobile-web-app-title" />
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
