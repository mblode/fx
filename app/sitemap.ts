import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://blue-noise.blode.co";

  return [
    {
      changeFrequency: "monthly",
      lastModified: new Date(),
      priority: 1.0,
      url: baseUrl,
    },
  ];
}
