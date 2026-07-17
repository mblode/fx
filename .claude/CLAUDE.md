# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FX (fx.blode.co) is a Next.js 16 web application that renders images and video through one of three modes: blue noise dithering, ASCII art, or an LED dot matrix. It's a fully client-side media tool built with React 19, TypeScript, and Tailwind CSS v4.

## Development Commands

- **Development server**: `npm run dev` (via `portless`, which assigns the port)
- **Production build**: `npm run build`
- **Format/fix code**: `npm run format` (`ultracite fix`)
- **Check code quality**: `npm run lint` (`ultracite check`)
- **Type check**: `npm run check:types` (`tsc --noEmit`)

## Code Quality & Pre-commit

The project uses **Ultracite** (a Biome-based preset) for formatting and linting, enforced via:

- **Lefthook pre-commit hook** (`lefthook.yml`): runs `ultracite fix` on staged files. `npm run prepare` installs it.
- Always run `npm run format` before committing if not using the hook

See AGENTS.md for detailed code standards (type safety, React patterns, accessibility requirements).

## Architecture

### Application Structure

- **Next.js App Router** (`app/`): Single route, client-side rendering
  - `app/page.tsx`: `StudioPage` — the whole interface (uses `"use client"`), wrapped in `<Suspense>` for nuqs
  - `app/layout.tsx`: Root layout, metadata, JSON-LD, Google Analytics
  - `app/globals.css`: Tailwind v4 config and the PP Neue Montreal `@font-face`

- **Render modes** (`lib/mode.ts`): `RenderMode = "blue-noise" | "ascii" | "led"`, with display copy in `MODE_OPTIONS` and download suffixes in `MODE_FILENAME_SUFFIX`. Mode is synced to the URL as `?mode=` via nuqs.

- **Component Organization**:
  - `components/ui/`: Radix UI primitives - styled with Tailwind and class-variance-authority
  - `components/app-sidebar.tsx`: mode switcher + the active mode's controls panel
  - `components/dither/`: `controls-panel.tsx` (blue-noise params), `canvas-preview.tsx` (image preview, hold-to-compare), `video-preview.tsx` (play/pause/seek), `header-actions.tsx` (upload, download/export)
  - `components/ascii/controls-panel.tsx`: ASCII/LED params (LED hides the color pickers)

- **Core Logic**:
  - `lib/dither/`: `types.ts` (`DitherParameters`, `NoiseTexture`, `RGB`, `MediaKind`), `core.ts` (`ditherImageData` — brightness → contrast → grayscale → blue-noise threshold → colorize), `utils.ts`, `video-export.ts` (WebCodecs + mp4-muxer, H.264 with audio re-mux)
  - `lib/ascii/`: the ASCII/LED engine. `core.ts`, `sampling.ts`, `characters.ts`, `font-metrics.ts`, `lookup.ts`, `led.ts`. LED is the same pipeline with `ledMode: true`.
  - `lib/workers/`: `dither-worker.ts` and `ascii-worker.ts` keep processing off the main thread
  - `lib/frame-renderer.ts`: applies the active mode to a single frame (shared by image and video paths)

- **Noise Textures** (`lib/noise/textures.ts`):
  - Pre-baked blue noise textures embedded as base64 data URLs (64×64, 128×128, 256×256)
  - `loadNoiseTexture()` converts data URLs to `NoiseTexture` objects
  - Large file (~292KB) due to embedded base64 images

- **Custom Hooks** (`hooks/`):
  - `use-dither.ts`: blue-noise state — parameters, processing state, debounced live preview
  - `use-ascii.ts`: ASCII/LED state; supersamples output (2–3× by DPR) so glyphs stay crisp. Caps source at `MAX_IMAGE_DIMENSION` (1400px).
  - `use-media-studio.ts`: video rAF render loop — play/pause, seek, duration, ready/error
  - `use-upload.ts`: react-dropzone wiring; loads `/placeholder.jpg` on first paint so the studio is never empty
  - `use-debounce.ts` / `use-throttle.ts`: generic timing hooks
  - `use-mobile.ts`: responsive breakpoint detection

### Key Technologies

- **Next.js 16** with React 19 (using React Compiler via `reactCompiler: true`)
- **TypeScript** with strict mode and `@/*` path aliases
- **Tailwind CSS v4** with PostCSS
- **Radix UI** for accessible component primitives
- **nuqs** for URL-synced state (`?mode=`)
- **react-colorful** for color pickers, **react-dropzone** for uploads
- **mp4-muxer** + WebCodecs for MP4 export

### Dithering Algorithm

`ditherImageData` in `lib/dither/core.ts` implements ordered dithering with blue noise:

1. Apply brightness, then contrast
2. Convert to grayscale (simple RGB average)
3. For each pixel, compare grayscale value to the corresponding blue noise threshold
4. Output foreground or background color based on the comparison
5. Optionally upscale (nearest-neighbor) by `pixelSize`

Blue noise textures are tiled using a wrap function to handle images larger than the noise texture. Textures are pre-baked at 64/128/256; the app hardcodes 256 and does not expose the size in the UI.

## Important Notes

- **Client-side only**: all processing happens in the browser (no server-side API)
- **Images and video**: `MediaKind = "image" | "video"`. Video previews live and exports to H.264 MP4 with the original audio re-muxed. Webcam capture and live recording were removed and should not be reintroduced without cause.
- **Canvas API**: heavy use of `HTMLCanvasElement` and `ImageData`
- **React 19**: uses ref as a prop (no `React.forwardRef`)
- **Base64 textures**: `lib/noise/textures.ts` is very large (~292KB) due to embedded noise patterns - avoid reading the entire file
- **Naming**: the product is **FX**; `"blue-noise"` names one render mode and the algorithm, not the app. Don't conflate them.
