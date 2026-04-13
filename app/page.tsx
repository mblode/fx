"use client";

import {
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  CloudUploadIcon,
  EyeOpenIcon,
} from "@fingertip/icons";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { AppSidebar } from "@/components/app-sidebar";
import { CanvasPreview } from "@/components/dither/canvas-preview";
import { ControlsPanel } from "@/components/dither/controls-panel";
import { Button } from "@/components/ui/button";
import { SidebarInset } from "@/components/ui/sidebar";
import { useDither } from "@/hooks/use-dither";
import { cn } from "@/lib/utils";

const DOWNLOAD_FEEDBACK_DURATION_MS = 2000;

function getDownloadFilename(uploadedImage: File | null): string {
  if (!uploadedImage?.name) {
    return "dithered-image.png";
  }

  const lastDotIndex = uploadedImage.name.lastIndexOf(".");
  if (lastDotIndex <= 0) {
    return `${uploadedImage.name}-dithered.png`;
  }

  const nameWithoutExtension = uploadedImage.name.slice(0, lastDotIndex);
  const extension = uploadedImage.name.slice(lastDotIndex);
  return `${nameWithoutExtension}-dithered${extension}`;
}

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

  const [showOriginal, setShowOriginal] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const canDownload = ditheredImage !== null;
  const originalToggleLabel = showOriginal
    ? "Show dithered image"
    : "Show original image";
  const uploadButtonLabel = uploadedImage ? "Upload new image" : "Upload image";
  const downloadButtonClassName = cn(downloadSuccess && "scale-110");

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) {
        setUploadedImage(acceptedFiles[0]);
        setShowOriginal(false);
      }
    },
    [setUploadedImage]
  );

  const handleToggleOriginal = () => {
    setShowOriginal((prev) => !prev);
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    multiple: false,
    noClick: uploadedImage !== null,
  });

  const handleDownload = () => {
    if (!ditheredImage) {
      return;
    }
    const filename = getDownloadFilename(uploadedImage);

    const canvas = document.createElement("canvas");
    canvas.width = ditheredImage.width;
    canvas.height = ditheredImage.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.putImageData(ditheredImage, 0, 0);

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

      setDownloadSuccess(true);
      window.setTimeout(
        () => setDownloadSuccess(false),
        DOWNLOAD_FEEDBACK_DURATION_MS
      );
    }, "image/png");
  };

  return (
    <>
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:border focus:bg-background focus:p-4"
        href="#main-content"
      >
        Skip to main content
      </a>
      <AppSidebar
        onParametersChange={updateParameters}
        originalDimensions={originalDimensions}
        parameters={parameters}
        uploadedImage={uploadedImage}
      />
      <SidebarInset className="flex flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 md:hidden">
          <h1 className="flex-1 font-semibold text-sm">Blue noise</h1>
          {canDownload && (
            <Button
              aria-label={originalToggleLabel}
              aria-pressed={showOriginal}
              onClick={handleToggleOriginal}
              size="sm"
              variant={showOriginal ? "default" : "outline"}
            >
              <EyeOpenIcon className="h-4 w-4" />
              Original
            </Button>
          )}
          <Button
            aria-label={uploadButtonLabel}
            onClick={open}
            size="sm"
            variant="outline"
          >
            <ArrowUpCircleIcon className="h-4 w-4" />
            Upload
          </Button>
          {canDownload && (
            <Button
              aria-label="Download dithered image"
              className={downloadButtonClassName}
              onClick={handleDownload}
              size="sm"
              variant="default"
            >
              <ArrowDownCircleIcon className="h-4 w-4" />
              Download
            </Button>
          )}
        </header>

        <header className="hidden h-14 shrink-0 items-center justify-end gap-2 border-b px-4 md:flex">
          {canDownload && (
            <Button
              aria-label={originalToggleLabel}
              aria-pressed={showOriginal}
              onClick={handleToggleOriginal}
              size="sm"
              variant={showOriginal ? "default" : "outline"}
            >
              <EyeOpenIcon className="size-4" />
              Original
            </Button>
          )}
          <Button
            aria-label={uploadButtonLabel}
            onClick={open}
            size="sm"
            variant="outline"
          >
            <ArrowUpCircleIcon className="size-4" />
            Upload
          </Button>
          {canDownload && (
            <Button
              className={downloadButtonClassName}
              onClick={handleDownload}
              size="sm"
            >
              <ArrowDownCircleIcon className="size-4" />
              Download
            </Button>
          )}
        </header>

        <div className="flex flex-1 flex-col">
          <div
            {...getRootProps()}
            className={cn(
              "relative flex flex-col transition-colors md:min-h-0 md:flex-1",
              isDragActive && "bg-primary/5",
              !uploadedImage && "cursor-pointer"
            )}
          >
            <input {...getInputProps()} />

            {isDragActive && (
              <div className="fade-in-0 pointer-events-none absolute inset-0 z-50 flex animate-in items-center justify-center bg-primary/5 duration-150">
                <div className="data-motion-scale fade-in-0 zoom-in-95 flex animate-in flex-col items-center gap-3 rounded-lg border-2 border-primary bg-background p-8 shadow-lg duration-200 [animation-timing-function:var(--ease-enter)]">
                  <CloudUploadIcon
                    aria-hidden="true"
                    className="fade-in-0 zoom-in-95 h-12 w-12 animate-in text-primary duration-200 [animation-delay:50ms] [animation-timing-function:var(--ease-enter)]"
                  />
                  <p className="fade-in-0 slide-in-from-bottom-2 animate-in font-medium text-lg text-primary duration-200 [animation-delay:100ms] [animation-timing-function:var(--ease-enter)]">
                    Drop image to upload
                  </p>
                </div>
              </div>
            )}

            <main
              className="flex w-full flex-col items-center justify-start gap-6 p-4 md:flex-1 md:items-center md:justify-center"
              id="main-content"
            >
              <h1 className="sr-only">
                Blue Noise Dither - Professional Image Dithering Tool
              </h1>
              <CanvasPreview
                ditheredImage={ditheredImage}
                isProcessing={isProcessing}
                onBrowse={open}
                showOriginal={showOriginal}
                uploadedImage={uploadedImage}
              />
            </main>
          </div>

          <section className="w-full border-border border-t bg-background px-4 py-6 md:hidden">
            <div className="mx-auto w-full max-w-2xl">
              <ControlsPanel
                disabled={!uploadedImage}
                onParametersChange={updateParameters}
                originalDimensions={originalDimensions}
                parameters={parameters}
              />
            </div>
          </section>
        </div>
      </SidebarInset>
    </>
  );
}
