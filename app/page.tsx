"use client";

import { Download, Upload } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { AppSidebar } from "@/components/app-sidebar";
import { CanvasPreview } from "@/components/dither/canvas-preview";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useDither } from "@/hooks/use-dither";
import { cn } from "@/lib/utils";

export default function DitherPage() {
  const {
    uploadedImage,
    ditheredImage,
    isProcessing,
    parameters,
    originalDimensions,
    setUploadedImage,
    updateParameters,
  } = useDither();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) {
        setUploadedImage(acceptedFiles[0]);
      }
    },
    [setUploadedImage]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    multiple: false,
    noClick: uploadedImage !== null,
  });

  const handleDownload = () => {
    if (!ditheredImage) return;

    // Generate filename from original with -dithered suffix
    let filename = "dithered-image.png";
    if (uploadedImage?.name) {
      const lastDotIndex = uploadedImage.name.lastIndexOf(".");
      if (lastDotIndex > 0) {
        const nameWithoutExt = uploadedImage.name.substring(0, lastDotIndex);
        const ext = uploadedImage.name.substring(lastDotIndex);
        filename = `${nameWithoutExt}-dithered${ext}`;
      } else {
        filename = `${uploadedImage.name}-dithered.png`;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = ditheredImage.width;
    canvas.height = ditheredImage.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.putImageData(ditheredImage, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();

      URL.revokeObjectURL(url);
    }, "image/png");
  };

  return (
    <>
      <AppSidebar
        onParametersChange={updateParameters}
        originalDimensions={originalDimensions}
        parameters={parameters}
        uploadedImage={uploadedImage}
      />
      <SidebarInset className="flex h-full flex-col">
        {/* Mobile header with menu trigger */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 md:hidden">
          <SidebarTrigger />
          <Separator className="h-6" orientation="vertical" />
          <h1 className="flex-1 font-semibold text-sm">Blue noise dither</h1>
          {uploadedImage && (
            <Button onClick={open} size="sm" variant="outline">
              <Upload className="h-4 w-4" />
            </Button>
          )}
          {ditheredImage && (
            <Button onClick={handleDownload} size="sm" variant="default">
              <Download className="h-4 w-4" />
            </Button>
          )}
        </header>

        {/* Desktop header with download button */}
        <header className="hidden h-14 shrink-0 items-center justify-end gap-2 border-b px-4 md:flex">
          {uploadedImage && (
            <Button onClick={open} size="sm" variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Upload new
            </Button>
          )}
          {ditheredImage && (
            <Button onClick={handleDownload} size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
        </header>

        <div
          {...getRootProps()}
          className={cn(
            "relative flex min-h-0 flex-1 transition-colors",
            isDragActive && "bg-primary/5",
            !uploadedImage && "cursor-pointer"
          )}
        >
          <input {...getInputProps()} />

          {/* Drag overlay - scoped to main content area */}
          {isDragActive && (
            <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-primary/10 backdrop-blur-sm">
              <div className="rounded-lg border-2 border-primary border-dashed bg-background/95 p-8 shadow-xl">
                <div className="flex flex-col items-center gap-3">
                  <svg
                    className="text-primary"
                    fill="none"
                    height="48"
                    role="img"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="48"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>Upload icon</title>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" x2="12" y1="15" y2="3" />
                  </svg>
                  <p className="font-medium text-lg text-primary">
                    Drop image to upload
                  </p>
                </div>
              </div>
            </div>
          )}

          <main className="flex w-full flex-1 items-center justify-center p-4">
            <CanvasPreview
              ditheredImage={ditheredImage}
              isProcessing={isProcessing}
              uploadedImage={uploadedImage}
            />
          </main>
        </div>
      </SidebarInset>
    </>
  );
}
