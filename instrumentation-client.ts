import posthog from "posthog-js";

import { posthogHost, posthogKey } from "@/lib/site";

posthog.init(posthogKey, {
  api_host: posthogHost,
  defaults: "2026-05-30",
  // api_host is a reverse proxy, so the toolbar and links still need the real app.
  ui_host: "https://us.posthog.com",
});
