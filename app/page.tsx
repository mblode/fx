"use client";

import { ImageDropzone } from "@/components/dither/image-dropzone";
import { ControlsPanel } from "@/components/dither/controls-panel";
import { CanvasPreview } from "@/components/dither/canvas-preview";
import { DownloadButton } from "@/components/dither/download-button";
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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Blue Noise Dither</h1>
          <p className="text-muted-foreground mt-2">
            Apply high-quality blue noise dithering to your images
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
          <aside className="space-y-6">
            <ImageDropzone
              onImageUpload={setUploadedImage}
              currentImage={uploadedImage}
            />

            <ControlsPanel
              parameters={parameters}
              onParametersChange={updateParameters}
              disabled={!uploadedImage}
            />

            {ditheredImage && (
              <DownloadButton imageData={ditheredImage} filename="dithered-image.png" />
            )}
          </aside>

          <main>
            <CanvasPreview
              uploadedImage={uploadedImage}
              ditheredImage={ditheredImage}
              isProcessing={isProcessing}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
