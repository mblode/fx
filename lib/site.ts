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

/** Stable JSON-LD node ids, referenced by @id rather than duplicated inline. */
export const personId = `${siteUrl}/#person`;
export const organizationId = `${siteUrl}/#organization`;
export const websiteId = `${siteUrl}/#website`;
export const applicationId = `${siteUrl}/#webapp`;
