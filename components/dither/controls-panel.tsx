"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NOISE_TEXTURES } from "@/lib/noise/textures";
import type { DitherParameters } from "@/lib/dither/types";

interface ControlsPanelProps {
  parameters: DitherParameters;
  onParametersChange: (params: Partial<DitherParameters>) => void;
  disabled?: boolean;
}

export function ControlsPanel({ parameters, onParametersChange, disabled }: ControlsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dither Parameters</CardTitle>
        <CardDescription>Adjust settings to customize the effect</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="foreground">Foreground Color</Label>
          <Input
            id="foreground"
            type="color"
            value={parameters.foreground}
            onChange={(e) => onParametersChange({ foreground: e.target.value })}
            disabled={disabled}
            className="h-12 cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="background">Background Color</Label>
          <Input
            id="background"
            type="color"
            value={parameters.background}
            onChange={(e) => onParametersChange({ background: e.target.value })}
            disabled={disabled}
            className="h-12 cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contrast">
            Contrast: {parameters.contrast.toFixed(2)}
          </Label>
          <Slider
            id="contrast"
            min={0.5}
            max={2.0}
            step={0.05}
            value={[parameters.contrast]}
            onValueChange={([value]) => onParametersChange({ contrast: value })}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="noiseSize">Noise Texture Size</Label>
          <Select
            value={parameters.noiseSize.toString()}
            onValueChange={(value) => onParametersChange({ noiseSize: parseInt(value) })}
            disabled={disabled}
          >
            <SelectTrigger id="noiseSize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NOISE_TEXTURES.map((texture) => (
                <SelectItem key={texture.size} value={texture.size.toString()}>
                  {texture.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Resize Output (optional)</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="width" className="text-xs text-muted-foreground">
                Width
              </Label>
              <Input
                id="width"
                type="number"
                placeholder="Auto"
                value={parameters.width || ""}
                onChange={(e) =>
                  onParametersChange({
                    width: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                disabled={disabled}
              />
            </div>
            <div>
              <Label htmlFor="height" className="text-xs text-muted-foreground">
                Height
              </Label>
              <Input
                id="height"
                type="number"
                placeholder="Auto"
                value={parameters.height || ""}
                onChange={(e) =>
                  onParametersChange({
                    height: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
