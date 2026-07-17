"use client";

import dynamic from "next/dynamic";

// Loaded after hydration. Rendered from the server, @next/third-parties emits a
// <link rel="preload" as="script"> for the ~163KB gtag bundle, which then races
// the app's own JS for bandwidth on the critical path. Analytics never blocks
// interaction, so it can wait.
const GoogleAnalytics = dynamic(
  () => import("@next/third-parties/google").then((m) => m.GoogleAnalytics),
  { ssr: false }
);

export function Analytics({ gaId }: { gaId: string }) {
  return <GoogleAnalytics gaId={gaId} />;
}
