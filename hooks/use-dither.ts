"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { applyDither } from "@/lib/dither/core";
import type { DitherParameters } from "@/lib/dither/types";
import { loadNoiseTexture, NOISE_TEXTURES } from "@/lib/noise/textures";
import { useThrottle } from "./use-throttle";

const DEFAULT_PARAMETERS: DitherParameters = {
  foreground: "#000000",
  background: "#ffffff",
  contrast: 0,
  brightness: 0,
  noiseSize: 256,
  maxWidth: null,
  pixelSize: 1,
};

interface DitherJob {
  file: File;
  params: DitherParameters;
}

interface DitherWorkerResponse {
  id: number;
  blob?: Blob;
  width?: number;
  height?: number;
  error?: string;
}

const areParamsEqual = (a: DitherParameters, b: DitherParameters) => {
  return (
    a.foreground === b.foreground &&
    a.background === b.background &&
    a.contrast === b.contrast &&
    a.brightness === b.brightness &&
    a.noiseSize === b.noiseSize &&
    (a.maxWidth ?? null) === (b.maxWidth ?? null) &&
    a.pixelSize === b.pixelSize
  );
};

const loadImageDimensions = async (file: File) => {
  if (typeof createImageBitmap !== "undefined") {
    const bitmap = await createImageBitmap(file);
    const dims = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dims;
  }

  return await new Promise<{ width: number; height: number }>(
    (resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    }
  );
};

export function useDither() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [ditheredBlob, setDitheredBlob] = useState<Blob | null>(null);
  const [ditheredImageUrl, setDitheredImageUrl] = useState<string | null>(null);
  const [ditheredDimensions, setDitheredDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parameters, setParameters] =
    useState<DitherParameters>(DEFAULT_PARAMETERS);
  const [originalDimensions, setOriginalDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const throttledParams = useThrottle(parameters, 120);
  const workerRef = useRef<Worker | null>(null);
  const activeJobIdRef = useRef<number | null>(null);
  const pendingJobRef = useRef<DitherJob | null>(null);
  const requestIdRef = useRef(0);
  const lastScheduledJobRef = useRef<DitherJob | null>(null);
  const [workerReady, setWorkerReady] = useState(false);

  const scheduleWorkerJob = useCallback((job: DitherJob) => {
    const worker = workerRef.current;
    if (!worker) {
      return;
    }

    if (activeJobIdRef.current !== null) {
      pendingJobRef.current = job;
      return;
    }

    const lastJob = lastScheduledJobRef.current;
    if (
      lastJob &&
      lastJob.file === job.file &&
      areParamsEqual(lastJob.params, job.params)
    ) {
      return;
    }

    requestIdRef.current += 1;
    activeJobIdRef.current = requestIdRef.current;
    lastScheduledJobRef.current = job;
    setIsProcessing(true);
    worker.postMessage({
      id: activeJobIdRef.current,
      file: job.file,
      params: job.params,
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const supported =
      "Worker" in window &&
      "OffscreenCanvas" in window &&
      "createImageBitmap" in window;

    if (!supported) {
      setWorkerReady(false);
      return;
    }

    const worker = new Worker(
      new URL("../lib/workers/dither-worker.ts", import.meta.url),
      { type: "module" }
    );

    workerRef.current = worker;
    setWorkerReady(true);

    const handleError = () => {
      workerRef.current = null;
      setWorkerReady(false);
    };

    worker.addEventListener("error", handleError);

    return () => {
      worker.removeEventListener("error", handleError);
      worker.terminate();
      workerRef.current = null;
      setWorkerReady(false);
    };
  }, []);

  useEffect(() => {
    if (!(workerReady && workerRef.current)) {
      return;
    }

    const handleMessage = (event: MessageEvent<DitherWorkerResponse>) => {
      const { id, blob, width, height, error } = event.data;
      if (id !== activeJobIdRef.current) {
        return;
      }

      activeJobIdRef.current = null;

      if (error) {
        console.error("Dithering worker error:", error);
      } else if (blob && width && height) {
        setDitheredBlob(blob);
        setDitheredDimensions({ width, height });
      }

      const pendingJob = pendingJobRef.current;
      if (pendingJob) {
        pendingJobRef.current = null;
        scheduleWorkerJob(pendingJob);
        return;
      }

      setIsProcessing(false);
    };

    const worker = workerRef.current;
    worker.addEventListener("message", handleMessage);

    return () => {
      worker.removeEventListener("message", handleMessage);
    };
  }, [workerReady, scheduleWorkerJob]);

  useEffect(() => {
    if (!uploadedImage) {
      setOriginalDimensions(null);
      setDitheredBlob(null);
      setDitheredDimensions(null);
      setIsProcessing(false);
      pendingJobRef.current = null;
      activeJobIdRef.current = null;
      return;
    }

    setDitheredBlob(null);
    setDitheredDimensions(null);

    let cancelled = false;

    const hydrateDimensions = async () => {
      try {
        const dims = await loadImageDimensions(uploadedImage);
        if (cancelled) {
          return;
        }

        setOriginalDimensions(dims);
        const calculatedPixelSize = Math.max(1, Math.round(dims.width / 512));
        setParameters((prev) => {
          if (
            prev.pixelSize === calculatedPixelSize &&
            (prev.maxWidth ?? null) === null
          ) {
            return prev;
          }

          return {
            ...prev,
            pixelSize: calculatedPixelSize,
            maxWidth: null,
          };
        });
      } catch (error) {
        console.error("Failed to read image dimensions:", error);
      }
    };

    hydrateDimensions();

    return () => {
      cancelled = true;
    };
  }, [uploadedImage]);

  useEffect(() => {
    if (!uploadedImage) {
      return;
    }

    if (workerReady && workerRef.current) {
      scheduleWorkerJob({ file: uploadedImage, params: throttledParams });
      return;
    }

    let cancelled = false;
    const currentRequestId = ++requestIdRef.current;

    const processOnMainThread = async () => {
      setIsProcessing(true);
      try {
        const noiseTexture = NOISE_TEXTURES.find(
          (texture) => texture.size === throttledParams.noiseSize
        );
        if (!noiseTexture) {
          throw new Error("Noise texture not found");
        }

        const noise = await loadNoiseTexture(noiseTexture.dataUrl);
        const imageData = await applyDither(
          uploadedImage,
          noise,
          throttledParams
        );

        const canvas = document.createElement("canvas");
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Could not get canvas context");
        }

        ctx.putImageData(imageData, 0, 0);
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, "image/png");
        });

        if (!blob || cancelled || currentRequestId !== requestIdRef.current) {
          return;
        }

        setDitheredBlob(blob);
        setDitheredDimensions({
          width: imageData.width,
          height: imageData.height,
        });
      } catch (error) {
        if (!cancelled) {
          console.error("Dithering error:", error);
        }
      } finally {
        if (!cancelled && currentRequestId === requestIdRef.current) {
          setIsProcessing(false);
        }
      }
    };

    processOnMainThread();

    return () => {
      cancelled = true;
    };
  }, [uploadedImage, throttledParams, workerReady, scheduleWorkerJob]);

  useEffect(() => {
    if (!ditheredBlob) {
      setDitheredImageUrl(null);
      return;
    }

    const url = URL.createObjectURL(ditheredBlob);
    setDitheredImageUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [ditheredBlob]);

  const updateParameters = useCallback((updates: Partial<DitherParameters>) => {
    setParameters((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    uploadedImage,
    ditheredBlob,
    ditheredImageUrl,
    ditheredDimensions,
    isProcessing,
    parameters,
    originalDimensions,
    setUploadedImage,
    updateParameters,
  };
}
