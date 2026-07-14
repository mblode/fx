"use client";

import { PauseFilledIcon, PlayFilledIcon } from "blode-icons-react";
import type { RefObject } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoPreviewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  isReady: boolean;
  error: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isExporting: boolean;
  exportProgress: number;
  exportError: string | null;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoPreview({
  videoRef,
  canvasRef,
  isReady,
  error,
  isPlaying,
  currentTime,
  duration,
  isExporting,
  exportProgress,
  exportError,
  onTogglePlay,
  onSeek,
}: VideoPreviewProps) {
  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-3">
      {/*
        Source video: decoded off-screen and used only as a frame source for the
        dithered canvas. It must stay rendered (not `display:none`) — Chrome
        pauses non-rendered videos — so it's positioned out of the way at
        opacity 0 instead of hidden.
      */}
      <video
        className="pointer-events-none fixed top-0 left-0 size-24 opacity-0"
        muted
        playsInline
        ref={videoRef}
        tabIndex={-1}
      />

      <div className="relative flex w-full items-center justify-center">
        {error ? (
          <div className="flex w-full max-w-2xl flex-col items-center gap-2 rounded-3xl border-2 border-border border-dashed p-12 text-center">
            <p className="font-medium text-foreground">Video unavailable</p>
            <p className="text-muted-foreground text-sm leading-[1.6]">
              {error}
            </p>
          </div>
        ) : (
          <>
            <canvas
              className="block h-auto w-full max-w-full rounded-lg [image-rendering:pixelated]"
              ref={canvasRef}
            />
            {!isReady && (
              <div className="absolute inset-0">
                <Skeleton className="h-full w-full rounded-lg" />
              </div>
            )}
            {isExporting && (
              <div className="fade-in-0 absolute inset-0 flex animate-in items-center justify-center rounded-lg bg-background/80 duration-200">
                <div className="flex flex-col items-center gap-2 rounded-lg bg-background px-4 py-3 shadow-sm ring-1 ring-border">
                  <span className="font-medium text-sm">
                    Exporting&hellip; {Math.round(exportProgress * 100)}%
                  </span>
                  <div className="h-1.5 w-40 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-150"
                      style={{ width: `${Math.round(exportProgress * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Transport controls for the loaded video. */}
      {!error && isReady && (
        <div className="flex w-full items-center gap-3">
          <Button
            aria-label={isPlaying ? "Pause" : "Play"}
            onClick={onTogglePlay}
            size="icon"
            variant="outline"
          >
            {isPlaying ? (
              <PauseFilledIcon className="size-4" />
            ) : (
              <PlayFilledIcon className="size-4" />
            )}
          </Button>
          <input
            aria-label="Seek"
            className="h-1.5 flex-1 cursor-pointer accent-primary"
            max={duration || 0}
            min={0}
            onChange={(e) => onSeek(Number(e.target.value))}
            step={0.01}
            type="range"
            value={currentTime}
          />
          <span className="w-20 text-right text-muted-foreground text-sm tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      )}

      {exportError && (
        <p className="text-center text-destructive text-sm">{exportError}</p>
      )}
    </div>
  );
}
