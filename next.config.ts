import type { NextConfig } from "next";

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

  // Security and SEO headers
  async headers() {
    return [
      {
        headers: [
          {
            key: "Content-Type",
            value: "application/manifest+json",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=604800, must-revalidate",
          },
        ],
        source: "/manifest.json",
      },
      {
        headers: [
          {
            key: "Content-Type",
            value: "text/plain",
          },
        ],
        source: "/robots.txt",
      },
    ];
  },
};

export default nextConfig;
