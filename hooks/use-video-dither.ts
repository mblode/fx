"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createDitherScratch,
  type DitherScratch,
  ditherDrawable,
} from "@/lib/dither/core";
import type { DitherParameters, MediaKind } from "@/lib/dither/types";
import {
  createLiveRecorder,
  exportDitheredVideoFile,
  type LiveRecorder,
} from "@/lib/dither/video-export";
import { getNoiseTexture } from "@/lib/noise/textures";

interface UseVideoDitherProps {
  mediaKind: MediaKind;
  file: File | null;
  parameters: DitherParameters;
  /** Called once when a new source's dimensions become known. */
  onSourceLoaded?: (width: number, height: number) => void;
}

interface Dimensions {
  width: number;
  height: number;
}

export function useVideoDither({
  mediaKind,
  file,
  parameters,
  onSourceLoaded,
}: UseVideoDitherProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scratchRef = useRef<DitherScratch | null>(null);
  const noiseRef = useRef<{
    size: number;
    texture: Awaited<ReturnType<typeof getNoiseTexture>>;
  } | null>(null);
  const rafRef = useRef<number | null>(null);
  const loopActiveRef = useRef(false);
  const recorderRef = useRef<LiveRecorder | null>(null);
  const recordStartRef = useRef(0);

  // Latest params, read inside the render loop without restarting it.
  const paramsRef = useRef(parameters);
  paramsRef.current = parameters;

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
  const [isRecording, setIsRecording] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const isActive = mediaKind === "video" || mediaKind === "webcam";

  // Keep the noise texture current with the selected size.
  useEffect(() => {
    let cancelled = false;
    getNoiseTexture(parameters.noiseSize).then((texture) => {
      if (!cancelled) {
        noiseRef.current = { size: parameters.noiseSize, texture };
      }
    });
    return () => {
      cancelled = true;
    };
  }, [parameters.noiseSize]);

  const renderFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const noise = noiseRef.current?.texture;

    if (video && canvas && noise && video.readyState >= 2) {
      if (!scratchRef.current) {
        scratchRef.current = createDitherScratch();
      }
      const dithered = ditherDrawable(
        video,
        video.videoWidth,
        video.videoHeight,
        noise,
        paramsRef.current,
        scratchRef.current
      );

      if (
        canvas.width !== dithered.width ||
        canvas.height !== dithered.height
      ) {
        canvas.width = dithered.width;
        canvas.height = dithered.height;
        setDimensions({ width: dithered.width, height: dithered.height });
      }
      const ctx = canvas.getContext("2d");
      ctx?.putImageData(dithered, 0, 0);

      if (recorderRef.current) {
        recorderRef.current.addFrame(
          dithered,
          performance.now() - recordStartRef.current
        );
      }
    }
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
      renderFrame();
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [renderFrame]);

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
    let stream: MediaStream | null = null;
    let cancelled = false;

    setIsReady(false);
    setError(null);
    setCurrentTime(0);
    setDuration(0);

    const onLoadedMetadata = () => {
      setDimensions(null);
      setSourceDimensions({
        width: video.videoWidth,
        height: video.videoHeight,
      });
      setDuration(video.duration || 0);
      setIsReady(true);
      onSourceLoadedRef.current?.(video.videoWidth, video.videoHeight);
      startLoop();
      video.play().catch(() => {
        setIsPlaying(false);
      });
    };

    if (mediaKind === "video" && file) {
      objectUrl = URL.createObjectURL(file);
      video.srcObject = null;
      video.src = objectUrl;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.addEventListener("loadedmetadata", onLoadedMetadata);
      video.load();
    } else if (mediaKind === "webcam") {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((s) => {
          if (cancelled) {
            for (const t of s.getTracks()) {
              t.stop();
            }
            return;
          }
          stream = s;
          video.src = "";
          video.srcObject = s;
          video.loop = false;
          video.muted = true;
          video.playsInline = true;
          video.addEventListener("loadedmetadata", onLoadedMetadata);
        })
        .catch(() => {
          setError("Camera access was denied or is unavailable.");
        });
    }

    return () => {
      cancelled = true;
      stopLoop();
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.pause();
      if (stream) {
        for (const t of stream.getTracks()) {
          t.stop();
        }
      }
      video.srcObject = null;
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
    const noise = noiseRef.current?.texture;
    if (!(video && noise && file)) {
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
      const blob = await exportDitheredVideoFile({
        video,
        file,
        noise,
        params: paramsRef.current,
        onProgress: setExportProgress,
      });
      return blob;
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : "Video export failed."
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

  // Webcam recording.
  const startRecording = useCallback(async () => {
    const video = videoRef.current;
    const stream = video?.srcObject as MediaStream | null;
    if (!(video && dimensions)) {
      return;
    }
    const audioTrack = stream?.getAudioTracks()[0] ?? null;
    setExportError(null);
    try {
      recorderRef.current = await createLiveRecorder({
        width: dimensions.width,
        height: dimensions.height,
        audioTrack,
      });
      recordStartRef.current = performance.now();
      setIsRecording(true);
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : "Recording failed to start."
      );
    }
  }, [dimensions]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    const recorder = recorderRef.current;
    if (!recorder) {
      return null;
    }
    recorderRef.current = null;
    setIsRecording(false);
    return await recorder.stop();
  }, []);

  return {
    videoRef,
    canvasRef,
    dimensions,
    sourceDimensions,
    isPlaying,
    currentTime,
    duration,
    isReady,
    error,
    isExporting,
    exportProgress,
    isRecording,
    exportError,
    play,
    pause,
    togglePlay,
    seek,
    exportMp4,
    startRecording,
    stopRecording,
  };
}
