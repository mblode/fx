import posthog from "posthog-js";

import { posthogHost, posthogKey } from "@/lib/site";

posthog.init(posthogKey, {
  api_host: posthogHost,
  defaults: "2026-05-30",
});
