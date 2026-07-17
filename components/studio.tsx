"use client";

import { CloudUploadIcon } from "blode-icons-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";

import { AppSidebar } from "@/components/app-sidebar";
import { AsciiControlsPanel } from "@/components/ascii/controls-panel";
import { CanvasPreview } from "@/components/dither/canvas-preview";
import { ControlsPanel } from "@/components/dither/controls-panel";
import { HeaderActions } from "@/components/dither/header-actions";
import { VideoPreview } from "@/components/dither/video-preview";
import { ModeSwitcher } from "@/components/mode-switcher";
import { SidebarInset } from "@/components/ui/sidebar";
import { useAscii } from "@/hooks/use-ascii";
import { useDither } from "@/hooks/use-dither";
import { useMediaStudio } from "@/hooks/use-media-studio";
import { useUpload } from "@/hooks/use-upload";
import type { MediaKind, NoiseTexture } from "@/lib/dither/types";
import { isVideoFile } from "@/lib/dither/types";
import {
  createAsciiFrameRenderer,
  createDitherFrameRenderer,
} from "@/lib/frame-renderer";
import {
  DEFAULT_MODE,
  MODE_FILENAME_SUFFIX,
  MODE_VALUES,
  modeLabel,
} from "@/lib/mode";
import type { RenderMode } from "@/lib/mode";
import { getNoiseTexture } from "@/lib/noise/textures";
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

function outputFilename(
  name: string | undefined,
  suffix: string,
  ext: string
): string {
  const base = name?.replace(EXT_REGEX, "");
  return base ? `${base}-${suffix}.${ext}` : `${suffix}.${ext}`;
}

function resolveMediaKind(file: File | null): MediaKind {
  return isVideoFile(file) ? "video" : "image";
}

export function Studio() {
  const [mode, setMode] = useQueryState(
    "mode",
    parseAsStringLiteral(MODE_VALUES).withDefault(DEFAULT_MODE)
  );
  const { uploadedImage, isLoadingPlaceholder, setUploadedImage } = useUpload();

  const [showOriginal, setShowOriginal] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const isBlueNoise = mode === "blue-noise";

  const mediaKind = resolveMediaKind(uploadedImage);
  const isVideoMode = mediaKind !== "image";

  // Still-image rendering runs through the per-mode hooks; video is handled by
  // the shared media studio below. Each still hook is disabled when
  // its mode isn't active or when the source is a video.
  const stillImageEnabled = !isVideoMode;
  const asciiSourceFile =
    !isBlueNoise && !isVideoFile(uploadedImage) ? uploadedImage : null;

  const dither = useDither({
    enabled: isBlueNoise && stillImageEnabled,
    uploadedImage,
  });
  const ascii = useAscii({
    enabled: !isBlueNoise && stillImageEnabled,
    ledMode: mode === "led",
    uploadedImage: asciiSourceFile,
  });

  // Auto-scale a newly loaded video the same way images are scaled.
  const onSourceLoaded = useCallback(
    (width: number) => {
      dither.updateParameters({
        maxWidth: null,
        pixelSize: Math.max(1, Math.round(width / 512)),
      });
    },
    [dither.updateParameters]
  );

  // Latest parameters/mode, read inside the render loop without restarting it.
  const noiseRef = useRef<NoiseTexture | null>(null);
  const ditherParamsRef = useRef(dither.parameters);
  ditherParamsRef.current = dither.parameters;
  const asciiParamsRef = useRef(ascii.parameters);
  asciiParamsRef.current = ascii.parameters;
  const ledModeRef = useRef(mode === "led");
  ledModeRef.current = mode === "led";

  // Keep the noise texture ready for the blue-noise video renderer.
  useEffect(() => {
    let cancelled = false;
    getNoiseTexture(dither.parameters.noiseSize).then((texture) => {
      if (!cancelled) {
        noiseRef.current = texture;
      }
    });
    return () => {
      cancelled = true;
    };
  }, [dither.parameters.noiseSize]);

  // Stable per-mode frame renderers (they read the latest params via refs).
  const ditherRenderer = useMemo(
    () =>
      createDitherFrameRenderer({
        getNoise: () => noiseRef.current,
        getParams: () => ditherParamsRef.current,
      }),
    []
  );
  const asciiRenderer = useMemo(
    () =>
      createAsciiFrameRenderer({
        getLedMode: () => ledModeRef.current,
        getParams: () => asciiParamsRef.current,
      }),
    []
  );

  const video = useMediaStudio({
    file: mediaKind === "video" ? uploadedImage : null,
    mediaKind,
    onSourceLoaded,
    renderFrame: isBlueNoise ? ditherRenderer : asciiRenderer,
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) {
        setUploadedImage(acceptedFiles[0]);
        setShowOriginal(false);
      }
    },
    [setUploadedImage]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: { "image/*": [], "video/*": [] },
    maxFiles: 1,
    multiple: false,
    noClick: uploadedImage !== null,
    onDrop,
  });

  const handleModeChange = (next: RenderMode) => {
    setShowOriginal(false);
    setMode(next);
  };

  const flashSuccess = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  // The output shown in the preview: dither in blue-noise mode, ascii otherwise.
  const activeDithered = isBlueNoise
    ? dither.ditheredImage
    : ascii.ditheredImage;
  const activeProcessing = isBlueNoise
    ? dither.isProcessing
    : ascii.isProcessing;

  const handleDownloadImage = () => {
    if (!activeDithered) {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = activeDithered.width;
    canvas.height = activeDithered.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.putImageData(activeDithered, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      downloadBlob(
        blob,
        outputFilename(uploadedImage?.name, MODE_FILENAME_SUFFIX[mode], "png")
      );
      flashSuccess();
    }, "image/png");
  };

  const handleExportVideo = async () => {
    const blob = await video.exportMp4();
    if (blob) {
      downloadBlob(
        blob,
        outputFilename(uploadedImage?.name, MODE_FILENAME_SUFFIX[mode], "mp4")
      );
      flashSuccess();
    }
  };

  // Controls are disabled until there's a usable source.
  const controlsDisabled = !uploadedImage;

  const dimensionsForControls = (() => {
    if (isVideoMode) {
      return video.sourceDimensions;
    }
    return isBlueNoise ? dither.originalDimensions : ascii.renderDimensions;
  })();

  const headerActions = (
    <HeaderActions
      downloadSuccess={downloadSuccess}
      hasDitheredImage={activeDithered !== null}
      hasUpload={uploadedImage !== null}
      isExporting={video.isExporting}
      isVideoReady={video.isReady}
      mediaKind={mediaKind}
      onDownloadImage={handleDownloadImage}
      onExportVideo={handleExportVideo}
      onToggleOriginal={() => setShowOriginal((prev) => !prev)}
      onUpload={open}
      showOriginal={showOriginal}
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
        asciiParameters={ascii.parameters}
        disabled={controlsDisabled}
        ditherParameters={dither.parameters}
        mode={mode}
        onAsciiParametersChange={ascii.updateParameters}
        onDitherParametersChange={dither.updateParameters}
        onModeChange={handleModeChange}
        originalDimensions={dimensionsForControls}
      />
      <SidebarInset className="flex flex-col">
        {/* Mobile header */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 md:hidden">
          <ModeSwitcher
            className="h-8"
            mode={mode}
            onModeChange={handleModeChange}
          />
          <div className="flex-1" />
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
              !uploadedImage && "cursor-pointer"
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
              <h2 className="sr-only">{modeLabel(mode)} preview</h2>
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
                  onSeek={video.seek}
                  onTogglePlay={video.togglePlay}
                  videoRef={video.videoRef}
                />
              ) : (
                <CanvasPreview
                  ditheredImage={activeDithered}
                  isLoadingPlaceholder={isLoadingPlaceholder}
                  isProcessing={activeProcessing}
                  onBrowse={open}
                  showOriginal={showOriginal}
                  uploadedImage={isBlueNoise ? uploadedImage : asciiSourceFile}
                />
              )}
            </main>
          </div>

          <section className="w-full border-border border-t bg-background px-4 py-6 md:hidden">
            <div className="mx-auto w-full max-w-2xl">
              {isBlueNoise ? (
                <ControlsPanel
                  disabled={controlsDisabled}
                  onParametersChange={dither.updateParameters}
                  originalDimensions={dimensionsForControls}
                  parameters={dither.parameters}
                />
              ) : (
                <AsciiControlsPanel
                  disabled={controlsDisabled}
                  ledMode={mode === "led"}
                  onParametersChange={ascii.updateParameters}
                  parameters={ascii.parameters}
                  renderDimensions={dimensionsForControls}
                />
              )}
            </div>
          </section>
        </div>
      </SidebarInset>
    </>
  );
}
