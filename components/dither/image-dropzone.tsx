"use client";

import { ImageIcon, Upload } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ImageDropzoneProps {
  onImageUpload: (file: File) => void;
  currentImage: File | null;
}

export function ImageDropzone({
  onImageUpload,
  currentImage,
}: ImageDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) {
        onImageUpload(acceptedFiles[0]);
      }
    },
    [onImageUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <Card>
      <CardHeader className="p-3">
        <CardTitle className="text-sm">Upload Image</CardTitle>
        <CardDescription className="text-xs">
          Drag and drop or click to select an image
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div
          {...getRootProps()}
          className={cn(
            "cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            {isDragActive ? (
              <>
                <Upload className="h-10 w-10 text-primary" />
                <p className="font-medium text-primary text-sm">
                  Drop image here
                </p>
              </>
            ) : (
              <>
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
                <p className="max-w-full truncate text-muted-foreground text-xs">
                  {currentImage
                    ? currentImage.name
                    : "Drop image here or click to browse"}
                </p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
