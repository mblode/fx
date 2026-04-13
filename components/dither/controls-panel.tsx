"use client";

import { useState } from "react";
import { ColorPicker } from "@/components/ui/color-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { DitherParameters } from "@/lib/dither/types";

interface ControlsPanelProps {
  parameters: DitherParameters;
  onParametersChange: (params: Partial<DitherParameters>) => void;
  originalDimensions?: { width: number; height: number } | null;
  disabled?: boolean;
}

function toSliderValue(value: number): [number] {
  return [value];
}

function getOutputDimensions(
  parameters: DitherParameters,
  originalDimensions: { width: number; height: number } | null | undefined
): { width: number; height: number } | null {
  if (!originalDimensions) {
    return null;
  }

  const maxWidth = parameters.maxWidth;
  const width =
    maxWidth && originalDimensions.width > maxWidth
      ? maxWidth
      : originalDimensions.width;
  const height = Math.floor(
    originalDimensions.height * (width / originalDimensions.width)
  );

  return { width, height };
}

export function ControlsPanel({
  parameters,
  onParametersChange,
  originalDimensions,
  disabled,
}: ControlsPanelProps) {
  // Local drag state: non-null only while the user is actively dragging
  const [localBrightness, setLocalBrightness] = useState<number | null>(null);
  const [localContrast, setLocalContrast] = useState<number | null>(null);
  const [localPixelSize, setLocalPixelSize] = useState<number | null>(null);

  const displayBrightness = localBrightness ?? parameters.brightness;
  const displayContrast = localContrast ?? parameters.contrast;
  const displayPixelSize = localPixelSize ?? parameters.pixelSize;
  const outputDimensions = getOutputDimensions(parameters, originalDimensions);
  const maxWidthValue = parameters.maxWidth ?? "";
  const maxWidthPlaceholder =
    originalDimensions?.width.toString() ?? "Original";
  const isUsingOriginalWidth =
    !originalDimensions || outputDimensions?.width === originalDimensions.width;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <ColorPicker
          disabled={disabled}
          id="foreground"
          label="Foreground color"
          onChange={(value) => onParametersChange({ foreground: value })}
          value={parameters.foreground}
        />

        <ColorPicker
          disabled={disabled}
          id="background"
          label="Background color"
          onChange={(value) => onParametersChange({ background: value })}
          value={parameters.background}
        />

        <div className="space-y-2">
          <Label htmlFor="brightness">
            Brightness: {Math.round(displayBrightness)}
          </Label>
          <Slider
            disabled={disabled}
            id="brightness"
            max={100}
            min={-100}
            onValueChange={([value]) => setLocalBrightness(value)}
            onValueCommit={([value]) => {
              setLocalBrightness(null);
              onParametersChange({ brightness: value });
            }}
            showOrigin
            step={5}
            value={toSliderValue(displayBrightness)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contrast">
            Contrast: {Math.round(displayContrast)}
          </Label>
          <Slider
            disabled={disabled}
            id="contrast"
            max={100}
            min={-100}
            onValueChange={([value]) => setLocalContrast(value)}
            onValueCommit={([value]) => {
              setLocalContrast(null);
              onParametersChange({ contrast: value });
            }}
            showOrigin
            step={5}
            value={toSliderValue(displayContrast)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pixelSize">Pixelation: {displayPixelSize}×</Label>
          <Slider
            disabled={disabled}
            id="pixelSize"
            max={16}
            min={1}
            onValueChange={([value]) => setLocalPixelSize(value)}
            onValueCommit={([value]) => {
              setLocalPixelSize(null);
              onParametersChange({ pixelSize: value });
            }}
            step={1}
            value={toSliderValue(displayPixelSize)}
          />
          <p
            className="text-muted-foreground text-sm leading-[1.6]"
            style={{ textWrap: "pretty" }}
          >
            1 = no pixelation, higher = blockier pixels
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="maxWidth">Maximum width</Label>
            {originalDimensions && !isUsingOriginalWidth && (
              <button
                className="text-muted-foreground text-xs underline underline-offset-2 hover:text-foreground"
                onClick={() => onParametersChange({ maxWidth: null })}
                type="button"
              >
                Reset to original
              </button>
            )}
          </div>
          <Input
            disabled={disabled}
            id="maxWidth"
            inputMode="numeric"
            max={4096}
            min={256}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "") {
                onParametersChange({ maxWidth: null });
              } else {
                const numValue = Number.parseInt(value, 10);
                if (!Number.isNaN(numValue)) {
                  onParametersChange({ maxWidth: numValue });
                }
              }
            }}
            placeholder={maxWidthPlaceholder}
            step={128}
            type="number"
            value={maxWidthValue}
          />
          {originalDimensions && outputDimensions && (
            <p
              className="text-muted-foreground text-sm leading-[1.6]"
              style={{ textWrap: "pretty" }}
            >
              {isUsingOriginalWidth
                ? `Using original size: ${originalDimensions.width}\u00A0×\u00A0${originalDimensions.height}\u00A0px`
                : `Resizing from ${originalDimensions.width}\u00A0×\u00A0${originalDimensions.height} to ${outputDimensions.width}\u00A0×\u00A0${outputDimensions.height}\u00A0px`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
