"use client";

import { useCallback, useEffect, useState } from "react";
import { applyDither, loadImage } from "@/lib/dither/core";
import type { DitherParameters } from "@/lib/dither/types";
import { loadNoiseTexture, NOISE_TEXTURES } from "@/lib/noise/textures";
import { useDebounce } from "./use-debounce";

const DITHER_DEBOUNCE_MS = 300;
const DEFAULT_PREVIEW_WIDTH = 512;

const DEFAULT_PARAMETERS: DitherParameters = {
  foreground: "#000000",
  background: "#ffffff",
  contrast: 0,
  brightness: 0,
  noiseSize: 256,
  maxWidth: null,
  pixelSize: 1,
};

function getNoiseTextureDataUrl(size: number): string {
  const noiseTexture = NOISE_TEXTURES.find((texture) => texture.size === size);

  if (!noiseTexture) {
    throw new Error("Noise texture not found");
  }

  return noiseTexture.dataUrl;
}

function getPixelSizeForWidth(width: number): number {
  return Math.max(1, Math.round(width / DEFAULT_PREVIEW_WIDTH));
}

function hasDimensionsChanged(
  currentDimensions: { width: number; height: number } | null,
  nextWidth: number,
  nextHeight: number
): boolean {
  return (
    currentDimensions?.width !== nextWidth ||
    currentDimensions?.height !== nextHeight
  );
}

export function useDither() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [ditheredImage, setDitheredImage] = useState<ImageData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parameters, setParameters] =
    useState<DitherParameters>(DEFAULT_PARAMETERS);
  const [originalDimensions, setOriginalDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const debouncedParams = useDebounce(parameters, DITHER_DEBOUNCE_MS);

  useEffect(() => {
    if (!uploadedImage) {
      setDitheredImage(null);
      return;
    }

    let isCancelled = false;

    const processDither = async () => {
      setIsProcessing(true);

      try {
        const image = await loadImage(uploadedImage);
        if (isCancelled) {
          return;
        }

        if (
          hasDimensionsChanged(originalDimensions, image.width, image.height)
        ) {
          setOriginalDimensions({ width: image.width, height: image.height });

          setParameters((prev) => ({
            ...prev,
            pixelSize: getPixelSizeForWidth(image.width),
            maxWidth: null,
          }));
        }

        const noise = await loadNoiseTexture(
          getNoiseTextureDataUrl(debouncedParams.noiseSize)
        );
        if (isCancelled) {
          return;
        }

        const result = await applyDither(uploadedImage, noise, debouncedParams);
        if (isCancelled) {
          return;
        }

        setDitheredImage(result);
      } catch (error) {
        console.error("Dithering error:", error);
      } finally {
        if (!isCancelled) {
          setIsProcessing(false);
        }
      }
    };

    processDither();

    return () => {
      isCancelled = true;
    };
  }, [uploadedImage, debouncedParams, originalDimensions]);

  const updateParameters = useCallback((updates: Partial<DitherParameters>) => {
    setParameters((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    uploadedImage,
    ditheredImage,
    isProcessing,
    parameters,
    originalDimensions,
    setUploadedImage,
    updateParameters,
  };
}
