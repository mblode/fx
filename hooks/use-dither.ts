"use client";

import { useCallback, useEffect, useState } from "react";

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

// Never dither the preview larger than this many device pixels wide, so a huge
// window on a high-DPR display can't blow up the per-frame cost.
const MAX_PREVIEW_WIDTH = 2560;

interface UseDitherProps {
  /** The shared uploaded file, owned by useUpload. */
  uploadedImage: File | null;
  /** When false, the render mode is inactive and processing is skipped. */
  enabled: boolean;
  /**
   * Width in device pixels at which the preview is displayed. The preview is
   * dithered at this resolution so it renders 1:1 and stays crisp, instead of
   * being fractionally rescaled by the browser. Null until measured.
   */
  displayWidth?: number | null;
}

export function useDither({
  uploadedImage,
  enabled,
  displayWidth,
}: UseDitherProps) {
  const [ditheredImage, setDitheredImage] = useState<ImageData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parameters, setParameters] =
    useState<DitherParameters>(DEFAULT_PARAMETERS);
  const [originalDimensions, setOriginalDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const debouncedParams = useDebounce(parameters, 100);
  // Debounce the display width so dragging the window doesn't re-dither on
  // every resize tick.
  const debouncedDisplayWidth = useDebounce(displayWidth ?? null, 150);
  const previewWidth = debouncedDisplayWidth
    ? Math.min(MAX_PREVIEW_WIDTH, Math.round(debouncedDisplayWidth))
    : undefined;

  // Process image when parameters or uploaded image changes.
  // Video files are handled by useVideoDither, so skip them here.
  useEffect(() => {
    if (!(enabled && uploadedImage) || isVideoFile(uploadedImage)) {
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

        // Dither the preview at its on-screen resolution so it renders 1:1.
        const result = await applyDither(
          uploadedImage,
          noise,
          debouncedParams,
          previewWidth
        );

        setDitheredImage(result);
      } catch (error) {
        console.error("Dithering error:", error);
      } finally {
        setIsProcessing(false);
      }
    };

    processDither();
  }, [
    enabled,
    uploadedImage,
    debouncedParams,
    originalDimensions,
    previewWidth,
  ]);

  // Render at the source resolution for download, independent of the on-screen
  // preview size. Returns null when there's nothing to render.
  const renderForDownload = useCallback(async (): Promise<ImageData | null> => {
    if (!(uploadedImage && enabled) || isVideoFile(uploadedImage)) {
      return null;
    }
    const noise = await getNoiseTexture(parameters.noiseSize);
    return applyDither(uploadedImage, noise, parameters);
  }, [uploadedImage, enabled, parameters]);

  const updateParameters = useCallback((updates: Partial<DitherParameters>) => {
    setParameters((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    ditheredImage,
    isProcessing,
    originalDimensions,
    parameters,
    renderForDownload,
    updateParameters,
  };
}
