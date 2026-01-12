"use client";

import { CanvasPreview } from "@/components/dither/canvas-preview";
import { ControlsPanel } from "@/components/dither/controls-panel";
import { DownloadButton } from "@/components/dither/download-button";
import { ImageDropzone } from "@/components/dither/image-dropzone";
import { useDither } from "@/hooks/use-dither";

export default function DitherPage() {
  const {
    uploadedImage,
    ditheredImage,
    isProcessing,
    parameters,
    setUploadedImage,
    updateParameters,
  } = useDither();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <header className="mb-8">
          <h1 className="font-bold text-4xl tracking-tight">
            Blue Noise Dither
          </h1>
          <p className="mt-2 text-muted-foreground">
            Apply high-quality blue noise dithering to your images
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[400px_1fr]">
          <aside className="space-y-6">
            <ImageDropzone
              currentImage={uploadedImage}
              onImageUpload={setUploadedImage}
            />

            <ControlsPanel
              disabled={!uploadedImage}
              onParametersChange={updateParameters}
              parameters={parameters}
            />

            {ditheredImage && (
              <DownloadButton
                filename="dithered-image.png"
                imageData={ditheredImage}
              />
            )}
          </aside>

          <main>
            <CanvasPreview
              ditheredImage={ditheredImage}
              isProcessing={isProcessing}
              uploadedImage={uploadedImage}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
