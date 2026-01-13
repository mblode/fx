"use client";

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
          <Label htmlFor="contrast">
            Contrast: {Math.round(parameters.contrast * 50)}%
          </Label>
          <Slider
            disabled={disabled}
            id="contrast"
            max={2.0}
            min={0.0}
            onValueChange={([value]) => onParametersChange({ contrast: value })}
            step={0.02}
            value={[parameters.contrast]}
          />
          <p className="text-muted-foreground text-xs">
            50% = original, lower = less contrast, higher = more contrast
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pixelSize">Pixelation: {parameters.pixelSize}×</Label>
          <Slider
            disabled={disabled}
            id="pixelSize"
            max={16}
            min={1}
            onValueChange={([value]) =>
              onParametersChange({ pixelSize: value })
            }
            step={1}
            value={[parameters.pixelSize]}
          />
          <p className="text-muted-foreground text-xs">
            1 = no pixelation, higher = blockier pixels
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="maxWidth">Maximum width</Label>
            {originalDimensions && outputWidth !== originalDimensions.width && (
              <button
                className="text-muted-foreground text-xs hover:text-foreground"
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
            <p className="text-muted-foreground text-xs">
              {outputWidth === originalDimensions.width
                ? `Using original size: ${originalDimensions.width} × ${originalDimensions.height} px`
                : `Resizing from ${originalDimensions.width} × ${originalDimensions.height} to ${outputWidth} × ${outputHeight} px`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
