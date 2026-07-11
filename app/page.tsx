"use client";

import { CloudUploadIcon } from "blode-icons-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { AppSidebar } from "@/components/app-sidebar";
import { CanvasPreview } from "@/components/dither/canvas-preview";
import { ControlsPanel } from "@/components/dither/controls-panel";
import { HeaderActions } from "@/components/dither/header-actions";
import { VideoPreview } from "@/components/dither/video-preview";
import { SidebarInset } from "@/components/ui/sidebar";
import { useDither } from "@/hooks/use-dither";
import { useVideoDither } from "@/hooks/use-video-dither";
import type { MediaKind } from "@/lib/dither/types";
import { isVideoFile } from "@/lib/dither/types";
import { cn } from "@/lib/utils";

const EXT_REGEX = /\.[^/.]+$/;

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function ditheredFilename(name: string | undefined, ext: string): string {
  const base = name?.replace(EXT_REGEX, "");
  return base ? `${base}-dithered.${ext}` : `dithered.${ext}`;
}

function resolveMediaKind(webcamActive: boolean, file: File | null): MediaKind {
  if (webcamActive) {
    return "webcam";
  }
  if (isVideoFile(file)) {
    return "video";
  }
  return "image";
}

export default function DitherPage() {
  const {
    uploadedImage,
    ditheredImage,
    isProcessing,
    isLoadingPlaceholder,
    parameters,
    originalDimensions,
    setUploadedImage,
    updateParameters,
  } = useDither();

  const [showOriginal, setShowOriginal] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);

  const mediaKind = resolveMediaKind(webcamActive, uploadedImage);
  const isVideoMode = mediaKind !== "image";

  // Auto-scale a newly loaded video the same way images are scaled.
  const onSourceLoaded = useCallback(
    (width: number) => {
      updateParameters({
        pixelSize: Math.max(1, Math.round(width / 512)),
        maxWidth: null,
      });
    },
    [updateParameters]
  );

  const video = useVideoDither({
    mediaKind,
    file: mediaKind === "video" ? uploadedImage : null,
    parameters,
    onSourceLoaded,
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) {
        setWebcamActive(false);
        setUploadedImage(acceptedFiles[0]);
        setShowOriginal(false);
      }
    },
    [setUploadedImage]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "image/*": [], "video/*": [] },
    maxFiles: 1,
    multiple: false,
    noClick: uploadedImage !== null || webcamActive,
  });

  const flashSuccess = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  const handleDownloadImage = () => {
    if (!ditheredImage) {
      return;
    }

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
      downloadBlob(blob, ditheredFilename(uploadedImage?.name, "png"));
      flashSuccess();
    }, "image/png");
  };

  const handleExportVideo = async () => {
    const blob = await video.exportMp4();
    if (blob) {
      downloadBlob(blob, ditheredFilename(uploadedImage?.name, "mp4"));
      flashSuccess();
    }
  };

  const handleRecordToggle = async () => {
    if (video.isRecording) {
      const blob = await video.stopRecording();
      if (blob) {
        downloadBlob(blob, "webcam-dithered.mp4");
        flashSuccess();
      }
    } else {
      await video.startRecording();
    }
  };

  const toggleCamera = () => {
    setShowOriginal(false);
    setWebcamActive((prev) => !prev);
  };

  const controlsDisabled = !(uploadedImage || webcamActive);
  const dimensionsForControls = isVideoMode
    ? video.sourceDimensions
    : originalDimensions;

  const headerActions = (
    <HeaderActions
      downloadSuccess={downloadSuccess}
      hasDitheredImage={ditheredImage !== null}
      hasUpload={uploadedImage !== null}
      isExporting={video.isExporting}
      isRecording={video.isRecording}
      isVideoReady={video.isReady}
      mediaKind={mediaKind}
      onDownloadImage={handleDownloadImage}
      onExportVideo={handleExportVideo}
      onRecordToggle={handleRecordToggle}
      onToggleCamera={toggleCamera}
      onToggleOriginal={() => setShowOriginal((prev) => !prev)}
      onUpload={open}
      showOriginal={showOriginal}
      webcamActive={webcamActive}
    />
  );

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
        originalDimensions={dimensionsForControls}
        parameters={parameters}
        uploadedImage={uploadedImage}
      />
      <SidebarInset className="flex flex-col">
        {/* Mobile header */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 md:hidden">
          <p className="flex-1 font-semibold text-sm">Blue noise</p>
          {headerActions}
        </header>

        {/* Desktop header */}
        <header className="hidden h-14 shrink-0 items-center justify-end gap-2 border-b px-4 md:flex">
          {headerActions}
        </header>

        <div className="flex flex-1 flex-col">
          <div
            {...getRootProps()}
            className={cn(
              "relative flex flex-col transition-colors md:min-h-0 md:flex-1",
              isDragActive && "bg-primary/5",
              !(uploadedImage || webcamActive) && "cursor-pointer"
            )}
          >
            <input {...getInputProps()} />

            {/* Drag overlay - scoped to main content area */}
            {isDragActive && (
              <div className="fade-in-0 pointer-events-none absolute inset-0 z-50 flex animate-in items-center justify-center bg-primary/5 duration-150">
                <div className="data-motion-scale fade-in-0 zoom-in-95 flex animate-in flex-col items-center gap-3 rounded-lg border-2 border-primary bg-background p-8 shadow-lg duration-200 [animation-timing-function:var(--ease-enter)]">
                  <CloudUploadIcon
                    aria-hidden="true"
                    className="fade-in-0 zoom-in-95 h-12 w-12 animate-in text-primary duration-200 [animation-delay:50ms] [animation-timing-function:var(--ease-enter)]"
                  />
                  <p className="fade-in-0 slide-in-from-bottom-2 animate-in font-medium text-lg text-primary duration-200 [animation-delay:100ms] [animation-timing-function:var(--ease-enter)]">
                    Drop image or video to upload
                  </p>
                </div>
              </div>
            )}

            <main
              className="flex w-full flex-col items-center justify-start gap-6 p-4 md:flex-1 md:items-center md:justify-center"
              id="main-content"
            >
              <h1 className="sr-only">
                Blue Noise Dither - Professional Image & Video Dithering Tool
              </h1>
              {isVideoMode ? (
                <VideoPreview
                  canvasRef={video.canvasRef}
                  currentTime={video.currentTime}
                  duration={video.duration}
                  error={video.error}
                  exportError={video.exportError}
                  exportProgress={video.exportProgress}
                  isExporting={video.isExporting}
                  isPlaying={video.isPlaying}
                  isReady={video.isReady}
                  isRecording={video.isRecording}
                  mediaKind={mediaKind}
                  onSeek={video.seek}
                  onTogglePlay={video.togglePlay}
                  videoRef={video.videoRef}
                />
              ) : (
                <CanvasPreview
                  ditheredImage={ditheredImage}
                  isLoadingPlaceholder={isLoadingPlaceholder}
                  isProcessing={isProcessing}
                  onBrowse={open}
                  showOriginal={showOriginal}
                  uploadedImage={uploadedImage}
                />
              )}
            </main>
          </div>

          <section className="w-full border-border border-t bg-background px-4 py-6 md:hidden">
            <div className="mx-auto w-full max-w-2xl">
              <ControlsPanel
                disabled={controlsDisabled}
                onParametersChange={updateParameters}
                originalDimensions={dimensionsForControls}
                parameters={parameters}
              />
            </div>
          </section>
        </div>
      </SidebarInset>
    </>
  );
}
