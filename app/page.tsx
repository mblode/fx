import { Suspense } from "react";
import { preload } from "react-dom";

import { Studio } from "@/components/studio";
import { MODE_OPTIONS } from "@/lib/mode";

// Server component. The studio is client-only — it reads `?mode=` via nuqs,
// which suspends during prerender — so anything inside <Suspense> is absent
// from the served HTML. The heading and summary live out here so the page
// ships a real document to crawlers and assistive tech, not an empty shell.
export default function Page() {
  // useUpload fetches this on mount to seed the studio, so the request can't
  // start until the JS has downloaded, parsed, and hydrated — then decode and
  // dither still have to run before anything paints. Preloading moves the fetch
  // to HTML parse so it happens alongside the JS download rather than after it.
  preload("/placeholder.jpg", { as: "image", fetchPriority: "high" });

  return (
    <>
      <h1 className="sr-only">
        FX — dither, ASCII and LED tools for images and video
      </h1>
      <p className="sr-only">
        FX renders images and video in your browser using one of three modes:
        blue noise dithering, ASCII art, or an LED dot matrix. Processing runs
        entirely on your device — nothing is uploaded. Export stills as PNG and
        video as MP4.
      </p>
      <ul className="sr-only">
        {MODE_OPTIONS.map((option) => (
          <li key={option.value}>
            {option.label}: {option.description}
          </li>
        ))}
      </ul>
      <Suspense>
        <Studio />
      </Suspense>
    </>
  );
}
