"use client";

import { ArrowExpandHorIcon } from "@fingertip/icons";
import { useCallback, useEffect, useRef, useState } from "react";

interface ImageComparisonProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

export function ImageComparison({
  beforeImage,
  afterImage,
  beforeLabel = "Original",
  afterLabel = "Dithered",
  dimensions,
}: ImageComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [measuredDimensions, setMeasuredDimensions] = useState<{
    width: number;
    height: number;
  } | null>(dimensions ?? null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const onDragging = useCallback((e: PointerEvent) => {
    if (!(sliderRef.current && isDraggingRef.current)) {
      return;
    }
    const rect = sliderRef.current.getBoundingClientRect();
    const newSliderPosition = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, newSliderPosition)));
  }, []);

  const stopDragging = useCallback(() => {
    isDraggingRef.current = false;
    document.removeEventListener("pointermove", onDragging);
    document.removeEventListener("pointerup", stopDragging);
  }, [onDragging]);

  const startDragging = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      document.addEventListener("pointermove", onDragging);
      document.addEventListener("pointerup", stopDragging);
    },
    [onDragging, stopDragging]
  );

  useEffect(() => {
    return () => {
      document.removeEventListener("pointermove", onDragging);
      document.removeEventListener("pointerup", stopDragging);
    };
  }, [onDragging, stopDragging]);

  // Load image dimensions
  useEffect(() => {
    if (dimensions) {
      setMeasuredDimensions(dimensions);
      return;
    }

    const img = new Image();
    img.onload = () => {
      setMeasuredDimensions({ width: img.width, height: img.height });
    };
    img.src = afterImage;
  }, [afterImage, dimensions]);

  if (!measuredDimensions) {
    return null;
  }

  return (
    <div
      className="relative max-h-[90vh] w-full max-w-full overflow-hidden rounded-lg shadow-sm"
      ref={sliderRef}
      style={{
        aspectRatio: `${measuredDimensions.width} / ${measuredDimensions.height}`,
      }}
    >
      {/* After Image (Right side - background) */}
      <div className="absolute inset-0">
        {/* biome-ignore lint/correctness/useImageSize: Dynamic canvas-generated data URL, sized by CSS container */}
        {/* biome-ignore lint/performance/noImgElement: Client-side generated data URL, cannot use Next Image */}
        <img
          alt={afterLabel}
          className="size-full object-contain [image-rendering:pixelated]"
          src={afterImage}
        />
      </div>

      {/* Before Image (Left side - clipped) */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0% 100%)`,
        }}
      >
        {/* biome-ignore lint/correctness/useImageSize: Dynamic canvas-generated data URL, sized by CSS container */}
        {/* biome-ignore lint/performance/noImgElement: Client-side generated data URL, cannot use Next Image */}
        <img
          alt={beforeLabel}
          className="size-full object-contain"
          src={beforeImage}
        />
      </div>

      {/* Labels */}
      {beforeLabel && (
        <div className="absolute top-3 left-3 z-10">
          <div className="rounded-md bg-background/90 px-2 py-1 font-medium text-xs shadow-sm backdrop-blur-sm">
            {beforeLabel}
          </div>
        </div>
      )}

      {afterLabel && (
        <div className="absolute top-3 right-3 z-10">
          <div className="rounded-md bg-background/90 px-2 py-1 font-medium text-xs shadow-sm backdrop-blur-sm">
            {afterLabel}
          </div>
        </div>
      )}

      {/* Slider Handle */}
      <div
        className="absolute inset-y-0 z-20 flex -translate-x-1/2 cursor-ew-resize items-center justify-center"
        onPointerDown={startDragging}
        style={{ left: `${sliderPosition}%`, touchAction: "none" }}
      >
        {/* Slider Button */}
        <div className="relative z-10 flex size-9 items-center justify-center rounded-full bg-background text-foreground shadow-md ring-1 ring-border">
          <ArrowExpandHorIcon
            aria-label="Drag to compare images"
            className="h-5 w-5"
            role="img"
          />
        </div>

        {/* Vertical Line */}
        <div className="absolute h-full w-0.5 bg-border" />
      </div>
    </div>
  );
}
