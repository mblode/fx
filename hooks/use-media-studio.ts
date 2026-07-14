"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { MediaKind } from "@/lib/dither/types";
import { exportVideoFile } from "@/lib/dither/video-export";
import type { FrameRenderer } from "@/lib/frame-renderer";

interface UseMediaStudioProps {
  mediaKind: MediaKind;
  file: File | null;
  /** Renders one source frame into the active mode's output ImageData. */
  renderFrame: FrameRenderer;
  /** Called once when a new source's dimensions become known. */
  onSourceLoaded?: (width: number, height: number) => void;
}

interface Dimensions {
  width: number;
  height: number;
}

export function useMediaStudio({
  mediaKind,
  file,
  renderFrame,
  onSourceLoaded,
}: UseMediaStudioProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const loopActiveRef = useRef(false);

  // Latest frame renderer, read inside the loop without restarting it.
  const renderFrameRef = useRef(renderFrame);
  renderFrameRef.current = renderFrame;

  const onSourceLoadedRef = useRef(onSourceLoaded);
  onSourceLoadedRef.current = onSourceLoaded;

  const [dimensions, setDimensions] = useState<Dimensions | null>(null);
  const [sourceDimensions, setSourceDimensions] = useState<Dimensions | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportError, setExportError] = useState<string | null>(null);

  const isActive = mediaKind === "video";

  const renderFrameToCanvas = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!(video && canvas && video.readyState >= 2)) {
      return;
    }
    const rendered = renderFrameRef.current(
      video,
      video.videoWidth,
      video.videoHeight
    );
    if (!rendered) {
      return;
    }

    if (canvas.width !== rendered.width || canvas.height !== rendered.height) {
      canvas.width = rendered.width;
      canvas.height = rendered.height;
      setDimensions({ height: rendered.height, width: rendered.width });
    }
    const ctx = canvas.getContext("2d");
    ctx?.putImageData(rendered, 0, 0);
  }, []);

  const stopLoop = useCallback(() => {
    loopActiveRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // Drive the preview with requestAnimationFrame rather than
  // requestVideoFrameCallback: rAF keeps redrawing the current frame even while
  // the video is paused (so the first frame shows immediately and param changes
  // apply live), and doesn't depend on playback to fire.
  const startLoop = useCallback(() => {
    if (loopActiveRef.current) {
      return;
    }
    loopActiveRef.current = true;
    const tick = () => {
      if (!loopActiveRef.current) {
        return;
      }
      renderFrameToCanvas();
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [renderFrameToCanvas]);

  // Set up / tear down the source when the media kind or file changes.
  useEffect(() => {
    if (!isActive) {
      return;
    }
    const video = videoRef.current;
    if (!video) {
      return;
    }

    let objectUrl: string | null = null;

    setIsReady(false);
    setError(null);
    setCurrentTime(0);
    setDuration(0);

    const onLoadedMetadata = () => {
      setDimensions(null);
      setSourceDimensions({
        height: video.videoHeight,
        width: video.videoWidth,
      });
      setDuration(video.duration || 0);
      setIsReady(true);
      onSourceLoadedRef.current?.(video.videoWidth, video.videoHeight);
      startLoop();
      video.play().catch(() => {
        setIsPlaying(false);
      });
    };

    if (file) {
      objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.addEventListener("loadedmetadata", onLoadedMetadata);
      video.load();
    }

    return () => {
      stopLoop();
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.pause();
      video.src = "";
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [mediaKind, file, isActive, startLoop, stopLoop]);

  // Track playback state.
  useEffect(() => {
    const video = videoRef.current;
    if (!(video && isActive)) {
      return;
    }
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTime = () => setCurrentTime(video.currentTime);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTime);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTime);
    };
  }, [isActive]);

  const play = useCallback(() => {
    videoRef.current?.play().catch(() => {
      // ignore
    });
  }, []);

  const pause = useCallback(() => {
    videoRef.current?.pause();
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    if (video.paused) {
      video.play().catch(() => {
        // ignore
      });
    } else {
      video.pause();
    }
  }, []);

  const seek = useCallback((time: number) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  // Export the loaded file video to MP4.
  const exportMp4 = useCallback(async (): Promise<Blob | null> => {
    const video = videoRef.current;
    if (!(video && file)) {
      return null;
    }

    setIsExporting(true);
    setExportProgress(0);
    setExportError(null);
    stopLoop();
    const wasLooping = video.loop;
    video.loop = false;
    video.pause();

    try {
      const blob = await exportVideoFile({
        file,
        onProgress: setExportProgress,
        renderFrame: renderFrameRef.current,
        video,
      });
      return blob;
    } catch (error) {
      setExportError(
        error instanceof Error ? error.message : "Video export failed."
      );
      return null;
    } finally {
      setIsExporting(false);
      video.loop = wasLooping;
      video.currentTime = 0;
      startLoop();
      video.play().catch(() => {
        // ignore
      });
    }
  }, [file, startLoop, stopLoop]);

  return {
    canvasRef,
    currentTime,
    dimensions,
    duration,
    error,
    exportError,
    exportMp4,
    exportProgress,
    isExporting,
    isPlaying,
    isReady,
    pause,
    play,
    seek,
    sourceDimensions,
    togglePlay,
    videoRef,
  };
}
