"use client";

import { useMemo, useState } from "react";
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

  const brightnessValue = useMemo(
    () => [displayBrightness],
    [displayBrightness]
  );
  const contrastValue = useMemo(() => [displayContrast], [displayContrast]);
  const pixelSizeValue = useMemo(() => [displayPixelSize], [displayPixelSize]);

  // Calculate output dimensions based on maxWidth
  let outputWidth: number | null = null;
  if (originalDimensions) {
    if (
      parameters.maxWidth !== null &&
      parameters.maxWidth !== undefined &&
      originalDimensions.width > parameters.maxWidth
    ) {
      outputWidth = parameters.maxWidth;
    } else {
      outputWidth = originalDimensions.width;
    }
  }

  const outputHeight =
    outputWidth && originalDimensions
      ? Math.floor(
          originalDimensions.height * (outputWidth / originalDimensions.width)
        )
      : (originalDimensions?.height ?? null);

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
            value={brightnessValue}
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
            value={contrastValue}
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
            value={pixelSizeValue}
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
            {originalDimensions && outputWidth !== originalDimensions.width && (
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
            placeholder={originalDimensions?.width.toString() || "Original"}
            step={128}
            type="number"
            value={
              parameters.maxWidth === null || parameters.maxWidth === undefined
                ? ""
                : parameters.maxWidth
            }
          />
          {originalDimensions && (
            <p
              className="text-muted-foreground text-sm leading-[1.6]"
              style={{ textWrap: "pretty" }}
            >
              {outputWidth === originalDimensions.width
                ? `Using original size: ${originalDimensions.width}\u00A0×\u00A0${originalDimensions.height}\u00A0px`
                : `Resizing from ${originalDimensions.width}\u00A0×\u00A0${originalDimensions.height} to ${outputWidth}\u00A0×\u00A0${outputHeight}\u00A0px`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
