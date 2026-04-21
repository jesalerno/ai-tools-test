/**
 * Color harmony module.
 * Generates RGB palette arrays from a base hue using the specified harmony mode.
 */

import type { ColorHarmonyMode } from '../../shared/types.js';

/** RGB color triple — values in [0, 255]. */
export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

/** Convert HSL to RGB. h in [0,360], s/l in [0,1]. */
function hslToRgb(h: number, s: number, l: number): RgbColor {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/** Compute hue offsets for the given harmony mode. */
function harmonyOffsets(mode: ColorHarmonyMode): number[] {
  switch (mode) {
    case 'PRIMARY': return [0];
    case 'COMPLEMENTARY': return [0, 180];
    case 'TRIAD': return [0, 120, 240];
    case 'SQUARE': return [0, 90, 180, 270];
    case 'ANALOGOUS': return [0, 30, 60];
    case 'TETRADIC': return [0, 60, 180, 240];
  }
}

/**
 * Build a smooth PALETTE_SIZE-entry gradient palette from the harmony hues.
 * Lightness varies from 0.15 to 0.85 across the gradient.
 */
export function buildPalette(
  baseHue: number,
  mode: ColorHarmonyMode,
  paletteSize: number = 256
): RgbColor[] {
  const offsets = harmonyOffsets(mode);
  const hues = offsets.map((o) => (baseHue + o) % 360);
  const palette: RgbColor[] = [];

  for (let i = 0; i < paletteSize; i++) {
    const t = i / (paletteSize - 1);
    const hueIdx = Math.floor(t * hues.length);
    const clampedIdx = Math.min(hueIdx, hues.length - 1);
    const h = hues[clampedIdx] ?? 0;
    const l = 0.15 + t * 0.70;
    palette.push(hslToRgb(h, 0.8, l));
  }
  return palette;
}

/**
 * Map a normalized value [0,1] to a palette color using log mapping.
 * Prevents linear compression into a tiny palette range.
 */
export function logMapColor(t: number, palette: RgbColor[]): RgbColor {
  const logT = Math.log(t * (Math.E - 1) + 1);
  const idx = Math.min(Math.floor(logT * (palette.length - 1)), palette.length - 1);
  return palette[idx] ?? { r: 0, g: 0, b: 0 };
}

/**
 * Apply a dark tint to a palette color for "stable" regions.
 * Brightness range: 10–20% of original to keep pixels non-black.
 */
export function darkTint(color: RgbColor, factor: number = 0.15): RgbColor {
  return {
    r: Math.max(10, Math.round(color.r * factor)),
    g: Math.max(10, Math.round(color.g * factor)),
    b: Math.max(10, Math.round(color.b * factor)),
  };
}

/** Write an RGB color into a pixel buffer at the given offset. */
export function writePixel(
  data: Uint8ClampedArray,
  offset: number,
  color: RgbColor
): void {
  data[offset] = color.r;
  data[offset + 1] = color.g;
  data[offset + 2] = color.b;
  data[offset + 3] = 255;
}
