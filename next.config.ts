import type { NextConfig } from "next";

// Kept deliberately tight to what the app actually uses.
// - 'unsafe-inline' scripts: Next's hydration bootstrap and the JSON-LD block
//   are inline; a nonce would need middleware on an otherwise static site.
// - blob:/data: on img/media/worker: the whole pipeline is canvas + Web Workers
//   + object URLs for previews and PNG/MP4 export.
// - NEXT_PUBLIC_POSTHOG_HOST: our reverse proxy in front of PostHog, serving
//   both the snippet's assets and the ingestion endpoint.
// - us.posthog.com: the PostHog toolbar calls the app host, not ingestion.
//   internal-j.posthog.com is deliberately left out: that's PostHog's own
//   telemetry about the toolbar, and blocking it costs us nothing.
const PH_PROXY = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "";
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${PH_PROXY}`,
  `style-src 'self' 'unsafe-inline' ${PH_PROXY}`,
  `img-src 'self' data: blob: ${PH_PROXY}`,
  "media-src 'self' blob: data:",
  "worker-src 'self' blob:",
  `font-src 'self' ${PH_PROXY}`,
  `connect-src 'self' ${PH_PROXY} https://us.posthog.com`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  assetPrefix: "/fx",
  basePath: "/fx",
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
        // The zone origin and the *.vercel.app aliases are non-canonical
        // hostnames inside the sc-domain:blode.co Search Console property, so
        // left open they are a crawlable duplicate of the whole site.
        //
        // Keyed off x-forwarded-host, NOT host: the multi-zone rewrite proxies
        // to the origin, so `host` is the origin for real blode.co traffic
        // too. Matching on `host` would noindex the live site.
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
        has: [
          {
            key: "x-forwarded-host",
            type: "header" as const,
            value: String.raw`.*\.zone\.blode\.co|.*\.vercel\.app`,
          },
        ],
        source: "/:path*",
      },
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
  redirects() {
    return Promise.resolve(
      ["blue-noise.blode.co", "fx.blode.co"].flatMap((host) => [
        {
          basePath: false as const,
          destination: "https://blode.co/fx",
          has: [{ type: "host" as const, value: host }],
          permanent: true,
          source: "/",
        },
        {
          basePath: false as const,
          destination: "https://blode.co/fx/:path*",
          has: [{ type: "host" as const, value: host }],
          permanent: true,
          source: "/:path*",
        },
      ])
    );
  },
};

export default nextConfig;
