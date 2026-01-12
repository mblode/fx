"use client";

import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "./use-debounce";
import { applyDither } from "@/lib/dither/core";
import {
  NOISE_TEXTURES,
  loadNoiseTexture,
} from "@/lib/noise/textures";
import type { DitherParameters } from "@/lib/dither/types";

const DEFAULT_PARAMETERS: DitherParameters = {
  foreground: "#000000",
  background: "#ffffff",
  contrast: 1.0,
  noiseSize: 128,
  width: undefined,
  height: undefined,
};

export function useDither() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [ditheredImage, setDitheredImage] = useState<ImageData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parameters, setParameters] =
    useState<DitherParameters>(DEFAULT_PARAMETERS);

  // Debounce parameters for real-time updates (300ms)
  const debouncedParams = useDebounce(parameters, 300);

  // Process image when parameters or uploaded image changes
  useEffect(() => {
    if (!uploadedImage) {
      setDitheredImage(null);
      return;
    }

    const processDither = async () => {
      setIsProcessing(true);

      try {
        // Find noise texture
        const noiseTexture = NOISE_TEXTURES.find(
          (t) => t.size === debouncedParams.noiseSize
        );
        if (!noiseTexture) throw new Error("Noise texture not found");

        // Load noise texture
        const noise = await loadNoiseTexture(noiseTexture.dataUrl);

        // Apply dithering
        const result = await applyDither(
          uploadedImage,
          noise,
          debouncedParams
        );

        setDitheredImage(result);
      } catch (error) {
        console.error("Dithering error:", error);
      } finally {
        setIsProcessing(false);
      }
    };

    processDither();
  }, [uploadedImage, debouncedParams]);

  const updateParameters = useCallback(
    (updates: Partial<DitherParameters>) => {
      setParameters((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  return {
    uploadedImage,
    ditheredImage,
    isProcessing,
    parameters,
    setUploadedImage,
    updateParameters,
  };
}
