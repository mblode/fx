import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://blode.co/fx";

  return [
    {
      changeFrequency: "monthly",
      lastModified: new Date(),
      priority: 1.0,
      url: baseUrl,
    },
  ];
}
