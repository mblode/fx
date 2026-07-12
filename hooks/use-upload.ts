"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Shared upload state for the studio. Owns the single uploaded file, the webcam
 * toggle, and the initial placeholder load so every render mode (blue noise,
 * ascii, led) operates on the same source image.
 */
export function useUpload() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [webcamActive, setWebcamActive] = useState(false);

  const placeholderAttempted = useRef(false);
  const [isLoadingPlaceholder, setIsLoadingPlaceholder] = useState(true);

  useEffect(() => {
    if (placeholderAttempted.current || uploadedImage) {
      setIsLoadingPlaceholder(false);
      return;
    }
    placeholderAttempted.current = true;

    const loadPlaceholder = async () => {
      try {
        const response = await fetch("/placeholder.jpg");
        const blob = await response.blob();
        const file = new File([blob], "placeholder.jpg", { type: blob.type });
        setUploadedImage(file);
      } catch {
        // Silent fallback to empty state
      } finally {
        setIsLoadingPlaceholder(false);
      }
    };
    loadPlaceholder();
  }, [uploadedImage]);

  return {
    isLoadingPlaceholder,
    setUploadedImage,
    setWebcamActive,
    uploadedImage,
    webcamActive,
  };
}
