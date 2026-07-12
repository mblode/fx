"use client";

import {
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  Camera1Icon,
  EyeOpenIcon,
  RecordIcon,
  StopIcon,
} from "blode-icons-react";

import { Button } from "@/components/ui/button";
import type { MediaKind } from "@/lib/dither/types";
import { cn } from "@/lib/utils";

interface HeaderActionsProps {
  mediaKind: MediaKind;
  hasDitheredImage: boolean;
  hasUpload: boolean;
  webcamActive: boolean;
  showOriginal: boolean;
  downloadSuccess: boolean;
  isExporting: boolean;
  isRecording: boolean;
  isVideoReady: boolean;
  onToggleOriginal: () => void;
  onToggleCamera: () => void;
  onUpload: () => void;
  onDownloadImage: () => void;
  onExportVideo: () => void;
  onRecordToggle: () => void;
}

function PrimaryAction(props: HeaderActionsProps) {
  const {
    mediaKind,
    hasDitheredImage,
    downloadSuccess,
    isExporting,
    isRecording,
    isVideoReady,
    onDownloadImage,
    onExportVideo,
    onRecordToggle,
  } = props;

  if (mediaKind === "image") {
    if (!hasDitheredImage) {
      return null;
    }
    return (
      <Button
        aria-label="Download dithered image"
        className={cn(downloadSuccess && "scale-110")}
        onClick={onDownloadImage}
        size="sm"
      >
        <ArrowDownCircleIcon className="size-4" />
        Download
      </Button>
    );
  }

  if (mediaKind === "video") {
    return (
      <Button
        aria-label="Export dithered video"
        className={cn(downloadSuccess && "scale-110")}
        disabled={isExporting || !isVideoReady}
        onClick={onExportVideo}
        size="sm"
      >
        <ArrowDownCircleIcon className="size-4" />
        {isExporting ? "Exporting…" : "Export"}
      </Button>
    );
  }

  return (
    <Button
      aria-label={isRecording ? "Stop recording" : "Start recording"}
      disabled={!isVideoReady}
      onClick={onRecordToggle}
      size="sm"
      variant={isRecording ? "destructive" : "default"}
    >
      {isRecording ? (
        <StopIcon className="size-4" />
      ) : (
        <RecordIcon className="size-4" />
      )}
      {isRecording ? "Stop" : "Record"}
    </Button>
  );
}

export function HeaderActions(props: HeaderActionsProps) {
  const {
    mediaKind,
    hasDitheredImage,
    hasUpload,
    webcamActive,
    showOriginal,
    onToggleOriginal,
    onToggleCamera,
    onUpload,
  } = props;

  const canCompareOriginal = mediaKind === "image" && hasDitheredImage;

  return (
    <>
      {canCompareOriginal && (
        <Button
          aria-label={showOriginal ? "Show dithered" : "Show original"}
          aria-pressed={showOriginal}
          onClick={onToggleOriginal}
          size="sm"
          variant={showOriginal ? "default" : "outline"}
        >
          <EyeOpenIcon className="size-4" />
          Original
        </Button>
      )}
      <Button
        aria-label={webcamActive ? "Stop camera" : "Use camera"}
        aria-pressed={webcamActive}
        onClick={onToggleCamera}
        size="sm"
        variant={webcamActive ? "default" : "outline"}
      >
        <Camera1Icon className="size-4" />
        Camera
      </Button>
      <Button
        aria-label={hasUpload ? "Upload new file" : "Upload file"}
        onClick={onUpload}
        size="sm"
        variant="outline"
      >
        <ArrowUpCircleIcon className="size-4" />
        Upload
      </Button>
      <PrimaryAction {...props} />
    </>
  );
}
