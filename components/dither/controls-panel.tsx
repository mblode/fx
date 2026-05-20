"use client";

import {
  ArrowExpandHorIcon,
  BrightnessIcon,
  ColorSwatchIcon,
  ContrastIcon,
  DotGrid3x3Icon,
} from "blode-icons-react";
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

export function ControlsPanel({
  parameters,
  onParametersChange,
  originalDimensions,
  disabled,
}: ControlsPanelProps) {
  const [localBrightness, setLocalBrightness] = useState<number | null>(null);
  const [localContrast, setLocalContrast] = useState<number | null>(null);
  const [localPixelSize, setLocalPixelSize] = useState<number | null>(null);

  const displayBrightness = localBrightness ?? parameters.brightness;
  const displayContrast = localContrast ?? parameters.contrast;
  const displayPixelSize = localPixelSize ?? parameters.pixelSize;

  const brightnessValue = [displayBrightness];
  const contrastValue = [displayContrast];
  const pixelSizeValue = [displayPixelSize];

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
    <div className="space-y-4">
      <ColorPicker
        disabled={disabled}
        icon={
          <ColorSwatchIcon
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground"
          />
        }
        id="foreground"
        label="Foreground color"
        onChange={(value) => onParametersChange({ foreground: value })}
        value={parameters.foreground}
      />

      <ColorPicker
        disabled={disabled}
        icon={
          <ColorSwatchIcon
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground"
          />
        }
        id="background"
        label="Background color"
        onChange={(value) => onParametersChange({ background: value })}
        value={parameters.background}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between text-muted-foreground text-sm">
          <Label className="flex items-center gap-1.5" htmlFor="brightness">
            <BrightnessIcon
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground"
            />
            Brightness
          </Label>
          <output className="tabular-nums" htmlFor="brightness">
            {Math.round(displayBrightness)}
          </output>
        </div>
        <Slider
          disabled={disabled}
          id="brightness"
          max={100}
          min={-100}
          onValueChange={([value]) => {
            setLocalBrightness(value);
            onParametersChange({ brightness: value });
          }}
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
        <div className="flex items-center justify-between text-muted-foreground text-sm">
          <Label className="flex items-center gap-1.5" htmlFor="contrast">
            <ContrastIcon
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground"
            />
            Contrast
          </Label>
          <output className="tabular-nums" htmlFor="contrast">
            {Math.round(displayContrast)}
          </output>
        </div>
        <Slider
          disabled={disabled}
          id="contrast"
          max={100}
          min={-100}
          onValueChange={([value]) => {
            setLocalContrast(value);
            onParametersChange({ contrast: value });
          }}
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
        <div className="flex items-center justify-between text-muted-foreground text-sm">
          <Label className="flex items-center gap-1.5" htmlFor="pixelSize">
            <DotGrid3x3Icon
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground"
            />
            Scale
          </Label>
          <output className="tabular-nums" htmlFor="pixelSize">
            {displayPixelSize}
          </output>
        </div>
        <Slider
          disabled={disabled}
          id="pixelSize"
          max={16}
          min={1}
          onValueChange={([value]) => {
            setLocalPixelSize(value);
            onParametersChange({ pixelSize: value });
          }}
          onValueCommit={([value]) => {
            setLocalPixelSize(null);
            onParametersChange({ pixelSize: value });
          }}
          step={1}
          value={pixelSizeValue}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5" htmlFor="maxWidth">
            <ArrowExpandHorIcon
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground"
            />
            Maximum width
          </Label>
          {originalDimensions && outputWidth !== originalDimensions.width && (
            <button
              className="text-muted-foreground text-sm underline underline-offset-2 hover:text-foreground"
              onClick={() => onParametersChange({ maxWidth: null })}
              type="button"
            >
              Reset to original
            </button>
          )}
        </div>
        <Input
          className="tabular-nums max-sm:text-base"
          disabled={disabled}
          id="maxWidth"
          inputMode="numeric"
          max={4096}
          min={256}
          name="maxWidth"
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
          <p className="text-muted-foreground text-sm tabular-nums leading-[1.6]">
            {outputWidth === originalDimensions.width
              ? `Using original size: ${originalDimensions.width} × ${originalDimensions.height} px`
              : `Resizing from ${originalDimensions.width} × ${originalDimensions.height} to ${outputWidth} × ${outputHeight} px`}
          </p>
        )}
      </div>
    </div>
  );
}
