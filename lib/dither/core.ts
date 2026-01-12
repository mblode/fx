import type { DitherParameters, NoiseTexture } from "./types";
import { hexToRgb, wrap, applyContrast } from "./utils";

/**
 * Load an image from a File object
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Resize an image using Canvas API
 */
function resizeImage(
  img: HTMLImageElement,
  maxWidth?: number,
  maxHeight?: number
): { canvas: HTMLCanvasElement; width: number; height: number } {
  let width = img.width;
  let height = img.height;

  if (maxWidth && width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }

  if (maxHeight && height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(width);
  canvas.height = Math.floor(height);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);

  return { canvas, width, height };
}

/**
 * Apply blue noise dithering to an image
 * Adapted from blue-noise-typescript/src/dither.ts for browser use
 */
export async function applyDither(
  imageFile: File,
  noise: NoiseTexture,
  params: DitherParameters
): Promise<ImageData> {
  const fg = hexToRgb(params.foreground);
  const bg = hexToRgb(params.background);

  // Load image
  const img = await loadImage(imageFile);

  // Resize if needed
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  let width = img.width;
  let height = img.height;

  if (params.width || params.height) {
    const resized = resizeImage(img, params.width, params.height);
    canvas = resized.canvas;
    ctx = canvas.getContext("2d")!;
    width = resized.width;
    height = resized.height;
  } else {
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0);
  }

  // Get image data
  let imageData = ctx.getImageData(0, 0, width, height);

  // Apply contrast
  if (params.contrast !== 1.0) {
    imageData = applyContrast(imageData, params.contrast);
  }

  // Convert to grayscale
  const grayscaleData = new Uint8ClampedArray(width * height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const avg =
      (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
    grayscaleData[i / 4] = avg;
  }

  // Apply dithering algorithm (copied from dither.ts:111-138)
  const outputData = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const wrapX = wrap(noise.width, x);
      const wrapY = wrap(noise.height, y);

      const noiseIdx = wrapY * noise.width + wrapX;
      const imageIdx = y * width + x;
      const outputIdx = imageIdx * 4;

      const noiseLuma = noise.data[noiseIdx];
      const imageLuma = grayscaleData[imageIdx];

      const isBright = imageLuma > noiseLuma;

      if (isBright) {
        outputData[outputIdx] = bg.r;
        outputData[outputIdx + 1] = bg.g;
        outputData[outputIdx + 2] = bg.b;
      } else {
        outputData[outputIdx] = fg.r;
        outputData[outputIdx + 1] = fg.g;
        outputData[outputIdx + 2] = fg.b;
      }
      outputData[outputIdx + 3] = 255; // Alpha
    }
  }

  return new ImageData(outputData, width, height);
}
