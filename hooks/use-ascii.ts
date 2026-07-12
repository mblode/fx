"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { AsciiParameters } from "@/lib/ascii/params";
import {
  DEFAULT_ASCII_PARAMETERS,
  toAsciiRenderOptions,
} from "@/lib/ascii/params";
import type { AsciiRenderResult } from "@/lib/ascii/types";
import { renderAsciiAsync } from "@/lib/ascii/worker-client";

import { useDebounce } from "./use-debounce";

export type { AsciiParameters } from "@/lib/ascii/params";

const MAX_IMAGE_DIMENSION = 1400;

const getScaledDimensions = (
  width: number,
  height: number,
  maxDimension: number
): { width: number; height: number; scale: number } => {
  const maxSide = Math.max(width, height);
  if (maxSide <= maxDimension) {
    return { width, height, scale: 1 };
  }

  const scale = maxDimension / maxSide;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
    scale,
  };
};

const loadImageFromFile = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(error);
    };

    img.src = url;
  });

interface UseAsciiProps {
  /** The shared uploaded file, owned by useUpload. */
  uploadedImage: File | null;
  /** When false, the render mode is inactive and processing is skipped. */
  enabled: boolean;
  /** Render LED bars instead of ASCII glyphs (page mode = "led"). */
  ledMode: boolean;
}

/**
 * Hook for ASCII / LED rendering with debounced parameter updates.
 */
export function useAscii({ uploadedImage, enabled, ledMode }: UseAsciiProps) {
  const [asciiResult, setAsciiResult] = useState<AsciiRenderResult | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [parameters, setParameters] = useState<AsciiParameters>(
    DEFAULT_ASCII_PARAMETERS
  );
  const [renderDimensions, setRenderDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [previewCanvas, setPreviewCanvas] = useState<HTMLCanvasElement | null>(
    null
  );
  const loadRequestIdRef = useRef(0);
  const renderRequestIdRef = useRef(0);

  const debouncedParams = useDebounce(parameters, 100);

  // Load and scale image when a new file is uploaded (only while active).
  useEffect(() => {
    if (!(enabled && uploadedImage)) {
      setAsciiResult(null);
      setPreviewCanvas(null);
      setRenderDimensions(null);
      setIsProcessing(false);
      return;
    }

    const requestId = ++loadRequestIdRef.current;
    renderRequestIdRef.current += 1;
    setPreviewCanvas(null);
    setAsciiResult(null);
    setIsProcessing(true);

    const loadImage = async () => {
      try {
        const img = await loadImageFromFile(uploadedImage);
        if (requestId !== loadRequestIdRef.current) {
          return;
        }

        const originalWidth = img.naturalWidth || img.width;
        const originalHeight = img.naturalHeight || img.height;
        const scaled = getScaledDimensions(
          originalWidth,
          originalHeight,
          MAX_IMAGE_DIMENSION
        );

        setRenderDimensions((prev) => {
          if (
            prev &&
            prev.width === scaled.width &&
            prev.height === scaled.height
          ) {
            return prev;
          }
          return { width: scaled.width, height: scaled.height };
        });

        const canvas = document.createElement("canvas");
        canvas.width = scaled.width;
        canvas.height = scaled.height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          throw new Error("Failed to get canvas context");
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, scaled.width, scaled.height);

        if (requestId !== loadRequestIdRef.current) {
          return;
        }
        setPreviewCanvas(canvas);
      } catch (error) {
        console.error("Image load error:", error);
        if (requestId === loadRequestIdRef.current) {
          setIsProcessing(false);
        }
      }
    };

    loadImage();
  }, [enabled, uploadedImage]);

  // Render ASCII whenever parameters, mode, or the scaled source changes.
  useEffect(() => {
    if (!previewCanvas) {
      return;
    }

    const requestId = ++renderRequestIdRef.current;
    setIsProcessing(true);

    const processAscii = async () => {
      try {
        const ctx = previewCanvas.getContext("2d", {
          willReadFrequently: true,
        });
        if (!ctx) {
          throw new Error("Failed to get canvas context");
        }

        const imageData = ctx.getImageData(
          0,
          0,
          previewCanvas.width,
          previewCanvas.height
        );

        const renderOptions = toAsciiRenderOptions(
          debouncedParams,
          imageData.width,
          ledMode
        );
        const result = await renderAsciiAsync(imageData, renderOptions);

        if (requestId !== renderRequestIdRef.current) {
          return;
        }
        setAsciiResult(result);
      } catch (error) {
        console.error("ASCII rendering error:", error);
      } finally {
        if (requestId === renderRequestIdRef.current) {
          setIsProcessing(false);
        }
      }
    };

    processAscii();
  }, [debouncedParams, previewCanvas, ledMode]);

  const updateParameters = useCallback((updates: Partial<AsciiParameters>) => {
    setParameters((prev) => ({ ...prev, ...updates }));
  }, []);

  // For compatibility with the shared canvas preview, expose the rendered
  // ImageData under the same `ditheredImage` name the dither hook uses.
  const ditheredImage = asciiResult?.imageData ?? null;

  return {
    asciiResult,
    ditheredImage,
    asciiGrid: asciiResult?.grid ?? null,
    isProcessing,
    parameters,
    previewCanvas,
    renderDimensions,
    updateParameters,
  };
}
