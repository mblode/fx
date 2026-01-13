import type { RGB } from "./types";

const HEX_COLOR_REGEX = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

/**
 * Convert hex color to RGB
 * Copied from blue-noise-typescript/src/dither.ts:17-27
 */
export function hexToRgb(hex: string): RGB {
  const result = HEX_COLOR_REGEX.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    r: Number.parseInt(result[1], 16),
    g: Number.parseInt(result[2], 16),
    b: Number.parseInt(result[3], 16),
  };
}

/**
 * Modulo wrap function for tiling noise texture
 * Copied from blue-noise-typescript/src/dither.ts:32-34
 */
export function wrap(m: number, n: number): number {
  return n % m;
}

/**
 * Apply contrast adjustment to image data
 * Browser-adapted from Sharp's .linear() method
 */
export function applyContrast(
  imageData: ImageData,
  contrast: number
): ImageData {
  if (contrast === 1.0) {
    return imageData;
  }

  const factor =
    (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));
    data[i + 1] = Math.max(
      0,
      Math.min(255, factor * (data[i + 1] - 128) + 128)
    );
    data[i + 2] = Math.max(
      0,
      Math.min(255, factor * (data[i + 2] - 128) + 128)
    );
  }

  return imageData;
}
