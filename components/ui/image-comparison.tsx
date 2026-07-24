"use client";

import { useEffect, useRef, useState } from "react";

interface ImageComparisonProps {
  beforeImage: string;
  afterImage: string;
  showOriginal: boolean;
  dimensions?: {
    width: number;
    height: number;
  };
  /** Reports the displayed width in device pixels whenever it changes. */
  onDisplayWidthChange?: (deviceWidth: number) => void;
}

export function ImageComparison({
  beforeImage,
  afterImage,
  showOriginal,
  dimensions,
  onDisplayWidthChange,
}: ImageComparisonProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Report the rendered box width (device pixels) so the source can be dithered
  // at exactly the resolution it's shown at.
  useEffect(() => {
    const el = containerRef.current;
    if (!(el && onDisplayWidthChange)) {
      return;
    }
    const observer = new ResizeObserver((entries) => {
      const cssWidth = entries[0]?.contentRect.width ?? 0;
      if (cssWidth > 0) {
        onDisplayWidthChange(cssWidth * (window.devicePixelRatio || 1));
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [onDisplayWidthChange]);

  const [measuredDimensions, setMeasuredDimensions] = useState<{
    width: number;
    height: number;
  } | null>(dimensions ?? null);

  useEffect(() => {
    if (dimensions) {
      setMeasuredDimensions(dimensions);
      return;
    }

    const img = new Image();
    img.onload = () => {
      setMeasuredDimensions({ height: img.height, width: img.width });
    };
    img.src = afterImage;
  }, [afterImage, dimensions]);

  if (!measuredDimensions) {
    return null;
  }

  return (
    <div
      className="relative max-h-[90vh] w-full max-w-full overflow-hidden rounded-lg shadow-sm"
      ref={containerRef}
      style={{
        aspectRatio: `${measuredDimensions.width} / ${measuredDimensions.height}`,
      }}
    >
      {/* biome-ignore lint/correctness/useImageSize: Dynamic canvas-generated data URL, sized by CSS container */}
      {/* biome-ignore lint/performance/noImgElement: Client-side generated data URL, cannot use Next Image */}
      <img
        alt="Dithered"
        className={`size-full object-contain [image-rendering:pixelated] ${showOriginal ? "hidden" : "block"}`}
        src={afterImage}
      />

      {/* biome-ignore lint/correctness/useImageSize: Dynamic canvas-generated data URL, sized by CSS container */}
      {/* biome-ignore lint/performance/noImgElement: Client-side generated data URL, cannot use Next Image */}
      <img
        alt="Original"
        className={`size-full object-contain ${showOriginal ? "block" : "hidden"}`}
        src={beforeImage}
      />
    </div>
  );
}
