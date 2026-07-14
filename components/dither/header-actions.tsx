"use client";

import {
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  EyeOpenIcon,
} from "blode-icons-react";

import { Button } from "@/components/ui/button";
import type { MediaKind } from "@/lib/dither/types";
import { cn } from "@/lib/utils";

interface HeaderActionsProps {
  mediaKind: MediaKind;
  hasDitheredImage: boolean;
  hasUpload: boolean;
  showOriginal: boolean;
  downloadSuccess: boolean;
  isExporting: boolean;
  isVideoReady: boolean;
  onToggleOriginal: () => void;
  onUpload: () => void;
  onDownloadImage: () => void;
  onExportVideo: () => void;
}

function PrimaryAction(props: HeaderActionsProps) {
  const {
    mediaKind,
    hasDitheredImage,
    downloadSuccess,
    isExporting,
    isVideoReady,
    onDownloadImage,
    onExportVideo,
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

export function HeaderActions(props: HeaderActionsProps) {
  const {
    mediaKind,
    hasDitheredImage,
    hasUpload,
    showOriginal,
    onToggleOriginal,
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
