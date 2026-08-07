/** Canonical origin. Single source of truth for metadata, sitemap, and robots. */
export const siteUrl = "https://blode.co/fx";

export const siteName = "FX";

export const siteDescription =
  "Turn images and video into blue noise dithering, ASCII art, or an LED dot matrix. Free, fast, client-side — nothing leaves your browser.";

// Public client-side token, safe to ship. Hardcoded so every zone app shares
// one project without 30 separate Vercel env vars.
export const posthogKey = "phc_yYatHXysbRxjTyfmyCKSUyMSQpgepJPuxegz2HtpfX35";
// Set per Vercel project to our own reverse proxy, so ad blockers and tracker
// lists that block *.posthog.com do not drop analytics. Unset falls back to
// posthog-js's own default ingestion host.
export const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

/**
 * Stable JSON-LD node ids, referenced by @id rather than duplicated inline.
 *
 * The Person, Organization and WebSite ids belong to blode.co and are only ever
 * referenced here, never redefined. blode.co/fx is a path on blode.co behind a
 * rewrite, not a site of its own: a `blode.co/fx/#person` publishes a second
 * Matthew Blode on the same domain and splits the entity. Contract:
 * blode-co/apps/web/.claude/knowledge/zone-conventions.md
 */
const host = "https://blode.co";

export const personId = `${host}/#person`;
export const organizationId = `${host}/#organization`;
export const websiteId = `${host}/#website`;

// Zone-local nodes keep the zone in the id.
export const webPageId = `${siteUrl}/#webpage`;
export const breadcrumbId = `${siteUrl}/#breadcrumb`;

export const breadcrumbJsonLd = {
  "@id": breadcrumbId,
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", item: `${host}/`, name: "Home", position: 1 },
    {
      "@type": "ListItem",
      item: `${host}/projects`,
      name: "Projects",
      position: 2,
    },
    { "@type": "ListItem", item: siteUrl, name: siteName, position: 3 },
  ],
};
