import type { NextConfig } from "next";

// Kept deliberately tight to what the app actually uses.
// - 'unsafe-inline' scripts: Next's hydration bootstrap and the JSON-LD block
//   are inline; a nonce would need middleware on an otherwise static site.
// - blob:/data: on img/media/worker: the whole pipeline is canvas + Web Workers
//   + object URLs for previews and PNG/MP4 export.
// - googletagmanager/google-analytics: the GA4 tag.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.googletagmanager.com https://*.google-analytics.com",
  "media-src 'self' blob: data:",
  "worker-src 'self' blob:",
  "font-src 'self'",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  reactCompiler: true,

  // TypeScript 7's compiler API moved to typescript/unstable/*, which Next's
  // built-in inline type check can't load. `tsc --noEmit` (check:types) is the
  // real type gate; this only disables Next's redundant check.
  typescript: {
    ignoreBuildErrors: true,
  },

  // Compression for better performance
  compress: true,

  // Security headers. HSTS is intentionally omitted: Vercel already sends
  // `max-age=63072000`, and adding includeSubDomains/preload here would apply
  // to every blode.co subdomain irreversibly.
  async headers() {
    return [
      {
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: CSP,
          },
        ],
        source: "/:path*",
      },
      {
        // app/manifest.json is a static file, so Next serves it as
        // application/json; the spec wants application/manifest+json.
        headers: [
          { key: "Content-Type", value: "application/manifest+json" },
          {
            key: "Cache-Control",
            value: "public, max-age=604800, must-revalidate",
          },
        ],
        source: "/manifest.json",
      },
    ];
  },
};

export default nextConfig;
