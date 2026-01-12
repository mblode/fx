"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { DitherParameters } from "@/lib/dither/types";
import { NOISE_TEXTURES } from "@/lib/noise/textures";

interface ControlsPanelProps {
  parameters: DitherParameters;
  onParametersChange: (params: Partial<DitherParameters>) => void;
  disabled?: boolean;
}

export function ControlsPanel({
  parameters,
  onParametersChange,
  disabled,
}: ControlsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dither Parameters</CardTitle>
        <CardDescription>
          Adjust settings to customize the effect
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="foreground">Foreground Color</Label>
          <Input
            className="h-12 cursor-pointer"
            disabled={disabled}
            id="foreground"
            onChange={(e) => onParametersChange({ foreground: e.target.value })}
            type="color"
            value={parameters.foreground}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="background">Background Color</Label>
          <Input
            className="h-12 cursor-pointer"
            disabled={disabled}
            id="background"
            onChange={(e) => onParametersChange({ background: e.target.value })}
            type="color"
            value={parameters.background}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contrast">
            Contrast: {parameters.contrast.toFixed(2)}
          </Label>
          <Slider
            disabled={disabled}
            id="contrast"
            max={2.0}
            min={0.5}
            onValueChange={([value]) => onParametersChange({ contrast: value })}
            step={0.05}
            value={[parameters.contrast]}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="noiseSize">Noise Texture Size</Label>
          <Select
            disabled={disabled}
            onValueChange={(value) =>
              onParametersChange({ noiseSize: Number.parseInt(value) })
            }
            value={parameters.noiseSize.toString()}
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
              <Label className="text-muted-foreground text-xs" htmlFor="width">
                Width
              </Label>
              <Input
                disabled={disabled}
                id="width"
                onChange={(e) =>
                  onParametersChange({
                    width: e.target.value
                      ? Number.parseInt(e.target.value)
                      : undefined,
                  })
                }
                placeholder="Auto"
                type="number"
                value={parameters.width || ""}
              />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs" htmlFor="height">
                Height
              </Label>
              <Input
                disabled={disabled}
                id="height"
                onChange={(e) =>
                  onParametersChange({
                    height: e.target.value
                      ? Number.parseInt(e.target.value)
                      : undefined,
                  })
                }
                placeholder="Auto"
                type="number"
                value={parameters.height || ""}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
