"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
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

  useEffect(() => {
    if (!(ditheredImage && canvasRef.current)) return;

    const canvas = canvasRef.current;
    canvas.width = ditheredImage.width;
    canvas.height = ditheredImage.height;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.putImageData(ditheredImage, 0, 0);
    }
  }, [ditheredImage]);

  if (!uploadedImage) {
    return (
      <Card className="flex h-[600px] items-center justify-center">
        <CardContent>
          <p className="text-muted-foreground">
            Upload an image to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isProcessing) {
    return (
      <Card className="h-[600px]">
        <CardContent className="h-full p-6">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <canvas
          className="h-auto w-full rounded border border-border"
          ref={canvasRef}
        />
      </CardContent>
    </Card>
  );
}
