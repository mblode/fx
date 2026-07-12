"use client";

import { useEffect, useState } from "react";

interface ImageComparisonProps {
  beforeImage: string;
  afterImage: string;
  showOriginal: boolean;
  dimensions?: {
    width: number;
    height: number;
  };
}

export function ImageComparison({
  beforeImage,
  afterImage,
  showOriginal,
  dimensions,
}: ImageComparisonProps) {
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
