"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { applyDither } from "@/lib/dither/core";
import type { DitherParameters } from "@/lib/dither/types";
import { isVideoFile } from "@/lib/dither/types";
import { getNoiseTexture } from "@/lib/noise/textures";

import { useDebounce } from "./use-debounce";

const DEFAULT_PARAMETERS: DitherParameters = {
  background: "#ffffff",
  brightness: 0,
  contrast: 0,
  foreground: "#000000",
  maxWidth: null,
  noiseSize: 256,
  pixelSize: 1,
};

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

  const debouncedParams = useDebounce(parameters, 100);

  const placeholderAttempted = useRef(false);
  const [isLoadingPlaceholder, setIsLoadingPlaceholder] = useState(true);

  useEffect(() => {
    if (placeholderAttempted.current || uploadedImage) {
      setIsLoadingPlaceholder(false);
      return;
    }
    placeholderAttempted.current = true;

    const loadPlaceholder = async () => {
      try {
        const response = await fetch("/placeholder.jpg");
        const blob = await response.blob();
        const file = new File([blob], "placeholder.jpg", { type: blob.type });
        setUploadedImage(file);
      } catch {
        // Silent fallback to empty state
      } finally {
        setIsLoadingPlaceholder(false);
      }
    };
    loadPlaceholder();
  }, [uploadedImage]);

  // Process image when parameters or uploaded image changes.
  // Video files are handled by useVideoDither, so skip them here.
  useEffect(() => {
    if (!uploadedImage || isVideoFile(uploadedImage)) {
      setDitheredImage(null);
      return;
    }

    const processDither = async () => {
      setIsProcessing(true);

      try {
        // Load image to get original dimensions
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const imgEl = new Image();
          imgEl.onload = () => {
            URL.revokeObjectURL(imgEl.src);
            resolve(imgEl);
          };
          imgEl.onerror = reject;
          imgEl.src = URL.createObjectURL(uploadedImage);
        });

        // Set original dimensions and calculate pixelSize if this is a new image
        if (!originalDimensions || originalDimensions.width !== img.width) {
          setOriginalDimensions({ height: img.height, width: img.width });

          // Calculate pixelSize as originalWidth / 512 and reset maxWidth to use original size
          const calculatedPixelSize = Math.max(1, Math.round(img.width / 512));
          setParameters((prev) => ({
            ...prev,
            maxWidth: null,
            pixelSize: calculatedPixelSize,
          }));
        }

        // Load noise texture (cached per size)
        const noise = await getNoiseTexture(debouncedParams.noiseSize);

        // Apply dithering
        const result = await applyDither(uploadedImage, noise, debouncedParams);

        setDitheredImage(result);
      } catch (error) {
        console.error("Dithering error:", error);
      } finally {
        setIsProcessing(false);
      }
    };

    processDither();
  }, [uploadedImage, debouncedParams, originalDimensions]);

  const updateParameters = useCallback((updates: Partial<DitherParameters>) => {
    setParameters((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    ditheredImage,
    isLoadingPlaceholder,
    isProcessing,
    originalDimensions,
    parameters,
    setUploadedImage,
    updateParameters,
    uploadedImage,
  };
}
