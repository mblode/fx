export interface DitherParameters {
  foreground: string; // Hex color
  background: string; // Hex color
  contrast: number; // 0.5 - 2.0
  noiseSize: number; // 64, 128, 256
  width?: number; // Optional resize
  height?: number; // Optional resize
}

export interface NoiseTexture {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}
