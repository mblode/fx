"use client";

import { useEffect, useState } from "react";
import { ColorPicker } from "@/components/ui/color-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useDebounce } from "@/hooks/use-debounce";
import type { DitherParameters } from "@/lib/dither/types";

const SLIDER_DEBOUNCE_MS = 150;

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
  const [localContrast, setLocalContrast] = useState(parameters.contrast);
  const [localBrightness, setLocalBrightness] = useState(parameters.brightness);
  const [localPixelSize, setLocalPixelSize] = useState(parameters.pixelSize);

  useEffect(() => {
    setLocalContrast(parameters.contrast);
  }, [parameters.contrast]);

  useEffect(() => {
    setLocalBrightness(parameters.brightness);
  }, [parameters.brightness]);

  const debouncedContrast = useDebounce(localContrast, SLIDER_DEBOUNCE_MS);
  const debouncedBrightness = useDebounce(localBrightness, SLIDER_DEBOUNCE_MS);
  const debouncedPixelSize = useDebounce(localPixelSize, SLIDER_DEBOUNCE_MS);

  useEffect(() => {
    if (debouncedContrast !== parameters.contrast) {
      onParametersChange({ contrast: debouncedContrast });
    }
  }, [debouncedContrast, onParametersChange, parameters.contrast]);

  useEffect(() => {
    if (debouncedBrightness !== parameters.brightness) {
      onParametersChange({ brightness: debouncedBrightness });
    }
  }, [debouncedBrightness, onParametersChange, parameters.brightness]);

  useEffect(() => {
    setLocalPixelSize(parameters.pixelSize);
  }, [parameters.pixelSize]);

  useEffect(() => {
    if (debouncedPixelSize !== parameters.pixelSize) {
      onParametersChange({ pixelSize: debouncedPixelSize });
    }
  }, [debouncedPixelSize, onParametersChange, parameters.pixelSize]);

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
            Brightness: {Math.round(localBrightness)}
          </Label>
          <div className="relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-foreground/40"
            />
            <Slider
              className="relative z-10"
              disabled={disabled}
              id="brightness"
              max={100}
              min={-100}
              onValueChange={([value]) => setLocalBrightness(value)}
              step={5}
              value={[localBrightness]}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contrast">
            Contrast: {Math.round(localContrast)}
          </Label>
          <div className="relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-foreground/40"
            />
            <Slider
              className="relative z-10"
              disabled={disabled}
              id="contrast"
              max={100}
              min={-100}
              onValueChange={([value]) => setLocalContrast(value)}
              step={5}
              value={[localContrast]}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pixelSize">Pixelation: {localPixelSize}×</Label>
          <Slider
            disabled={disabled}
            id="pixelSize"
            max={16}
            min={1}
            onValueChange={([value]) => setLocalPixelSize(value)}
            step={1}
            value={[localPixelSize]}
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
