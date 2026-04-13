import type { DitherParameters, NoiseTexture } from "./types";
import { applyBrightness, applyContrast, hexToRgb, wrap } from "./utils";

export function loadImage(file: File): Promise<HTMLImageElement> {
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

function createCanvasContext(
  width: number,
  height: number
): CanvasRenderingContext2D {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return ctx;
}

function getTargetDimensions(
  img: HTMLImageElement,
  maxWidth: number | null | undefined
): { width: number; height: number } {
  if (!maxWidth || img.width <= maxWidth) {
    return { width: img.width, height: img.height };
  }

  return {
    width: maxWidth,
    height: Math.floor((img.height * maxWidth) / img.width),
  };
}

function applyToneAdjustments(
  imageData: ImageData,
  params: DitherParameters
): ImageData {
  let adjustedImageData = imageData;

  if (params.brightness !== 0) {
    adjustedImageData = applyBrightness(adjustedImageData, params.brightness);
  }

  if (params.contrast !== 0) {
    adjustedImageData = applyContrast(adjustedImageData, params.contrast);
  }

  return adjustedImageData;
}

function toGrayscaleData(imageData: ImageData): Uint8ClampedArray {
  const grayscaleData = new Uint8ClampedArray(
    imageData.width * imageData.height
  );

  for (let index = 0; index < imageData.data.length; index += 4) {
    const averageLuma =
      (imageData.data[index] +
        imageData.data[index + 1] +
        imageData.data[index + 2]) /
      3;
    grayscaleData[index / 4] = averageLuma;
  }

  return grayscaleData;
}

function upscaleImageData(
  sourceData: Uint8ClampedArray,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  pixelSize: number
): ImageData {
  const upscaledData = new Uint8ClampedArray(targetWidth * targetHeight * 4);

  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const sourceX = Math.min(sourceWidth - 1, Math.floor(x / pixelSize));
      const sourceY = Math.min(sourceHeight - 1, Math.floor(y / pixelSize));
      const sourceIndex = (sourceY * sourceWidth + sourceX) * 4;
      const targetIndex = (y * targetWidth + x) * 4;

      upscaledData[targetIndex] = sourceData[sourceIndex];
      upscaledData[targetIndex + 1] = sourceData[sourceIndex + 1];
      upscaledData[targetIndex + 2] = sourceData[sourceIndex + 2];
      upscaledData[targetIndex + 3] = 255;
    }
  }

  return new ImageData(upscaledData, targetWidth, targetHeight);
}

export async function applyDither(
  imageFile: File,
  noise: NoiseTexture,
  params: DitherParameters
): Promise<ImageData> {
  const fg = hexToRgb(params.foreground);
  const bg = hexToRgb(params.background);

  const img = await loadImage(imageFile);
  const { width: targetWidth, height: targetHeight } = getTargetDimensions(
    img,
    params.maxWidth
  );
  const pixelSize = Math.max(1, Math.floor(params.pixelSize));
  const ditherWidth = Math.max(1, Math.floor(targetWidth / pixelSize));
  const ditherHeight = Math.max(1, Math.floor(targetHeight / pixelSize));

  const ctx = createCanvasContext(ditherWidth, ditherHeight);
  ctx.drawImage(img, 0, 0, ditherWidth, ditherHeight);

  const imageData = applyToneAdjustments(
    ctx.getImageData(0, 0, ditherWidth, ditherHeight),
    params
  );
  const grayscaleData = toGrayscaleData(imageData);
  const outputData = new Uint8ClampedArray(ditherWidth * ditherHeight * 4);

  for (let y = 0; y < ditherHeight; y++) {
    for (let x = 0; x < ditherWidth; x++) {
      const wrapX = wrap(noise.width, x);
      const wrapY = wrap(noise.height, y);

      const noiseIdx = wrapY * noise.width + wrapX;
      const imageIdx = y * ditherWidth + x;
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

  if (pixelSize === 1) {
    return new ImageData(outputData, ditherWidth, ditherHeight);
  }

  return upscaleImageData(
    outputData,
    ditherWidth,
    ditherHeight,
    targetWidth,
    targetHeight,
    pixelSize
  );
}
