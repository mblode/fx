"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DownloadButtonProps {
  imageData: ImageData;
  originalFilename?: string;
}

export function DownloadButton({
  imageData,
  originalFilename,
}: DownloadButtonProps) {
  const handleDownload = () => {
    // Generate filename from original with -dithered suffix
    let filename = "dithered-image.png";
    if (originalFilename) {
      const lastDotIndex = originalFilename.lastIndexOf(".");
      if (lastDotIndex > 0) {
        const nameWithoutExt = originalFilename.substring(0, lastDotIndex);
        const ext = originalFilename.substring(lastDotIndex);
        filename = `${nameWithoutExt}-dithered${ext}`;
      } else {
        filename = `${originalFilename}-dithered.png`;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.putImageData(imageData, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();

      URL.revokeObjectURL(url);
    }, "image/png");
  };

  return (
    <Button className="w-full" onClick={handleDownload} size="lg">
      <Download className="mr-2 h-4 w-4" />
      Download dithered image
    </Button>
  );
}
