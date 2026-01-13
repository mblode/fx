"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ImageComparison } from "@/components/ui/image-comparison";
import { Skeleton } from "@/components/ui/skeleton";

interface CanvasPreviewProps {
  uploadedImage: File | null;
  ditheredImage: ImageData | null;
  isProcessing: boolean;
}

export function CanvasPreview({
  uploadedImage,
  ditheredImage,
  isProcessing,
}: CanvasPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ditheredImageUrl, setDitheredImageUrl] = useState<string | null>(null);

  // Convert uploaded image to blob URL
  const originalImageUrl = useMemo(() => {
    if (!uploadedImage) {
      return null;
    }
    return URL.createObjectURL(uploadedImage);
  }, [uploadedImage]);

  // Convert dithered ImageData to blob URL
  useEffect(() => {
    if (!(ditheredImage && canvasRef.current)) {
      return;
    }

    const canvas = canvasRef.current;
    canvas.width = ditheredImage.width;
    canvas.height = ditheredImage.height;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.putImageData(ditheredImage, 0, 0);
      setDitheredImageUrl(canvas.toDataURL("image/png"));
    }
  }, [ditheredImage]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (originalImageUrl) {
        URL.revokeObjectURL(originalImageUrl);
      }
    };
  }, [originalImageUrl]);

  if (!uploadedImage) {
    return (
      <div className="flex w-full max-w-2xl items-center justify-center">
        <div className="flex w-full flex-col items-center gap-4 rounded-lg border-2 border-border border-dashed p-12 text-center">
          <svg
            className="text-muted-foreground"
            fill="none"
            height="64"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="64"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect height="18" rx="2" ry="2" width="18" x="3" y="3" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          <div className="flex flex-col gap-1">
            <p className="font-medium text-foreground">Drop an image here</p>
            <p className="text-muted-foreground text-sm">
              or drag and drop anywhere on this area
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex w-full items-center justify-center">
      {originalImageUrl && ditheredImageUrl ? (
        <>
          <ImageComparison
            afterImage={ditheredImageUrl}
            afterLabel="Dithered"
            beforeImage={originalImageUrl}
            beforeLabel="Original"
            key={ditheredImageUrl}
          />
          {isProcessing && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-background/50 backdrop-blur-[2px]">
              <div className="rounded-full bg-background px-3 py-1.5 font-medium text-sm shadow-sm ring-1 ring-border">
                Processing...
              </div>
            </div>
          )}
        </>
      ) : (
        isProcessing && (
          <div className="flex h-[600px] w-[800px] max-w-[90vw] items-center justify-center">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        )
      )}
      <canvas className="hidden" ref={canvasRef} />
    </div>
  );
}
