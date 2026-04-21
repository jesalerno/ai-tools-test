/**
 * Domain types and interfaces for fractal rendering.
 * No framework imports — pure domain logic only.
 */

import type { ColorHarmonyMode } from '../../shared/types.js';

/** Parameters for a single fractal render pass. */
export interface RenderParams {
  /** Canvas quadrant width in pixels. */
  width: number;
  /** Canvas quadrant height in pixels. */
  height: number;
  /** Number of iterations (500–2000). */
  iterations: number;
  /** Zoom level (0.5–4.0). */
  zoom: number;
  /** PRNG seed for deterministic results. */
  seed: number;
  /** Base hue for palette (0–360). */
  baseHue: number;
  /** Color harmony mode. */
  colorMode: ColorHarmonyMode;
}

/** Result of a fractal render pass. */
export interface RenderResult {
  /** Pixel data for the quadrant (RGBA). */
  data: Uint8ClampedArray;
  /** Fraction of non-background pixels (0–1). */
  coverage: number;
}

/** Interface all fractal generators must implement. */
export interface FractalGenerator {
  /** Render a single quadrant. */
  render(params: RenderParams): RenderResult;
}

/** Simple seeded pseudo-random number generator (mulberry32). */
export function createPrng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let z = s;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 0xffffffff;
  };
}

/**
 * Find the maximum value in a typed array using an explicit loop.
 * Spread operator is prohibited on large arrays (RangeError risk).
 */
export function arrayMax(arr: Float64Array | number[]): number {
  let max = -Infinity;
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i] ?? -Infinity;
    if (v > max) max = v;
  }
  return max;
}

/**
 * Find the minimum value in a typed array using an explicit loop.
 * Spread operator is prohibited on large arrays (RangeError risk).
 */
export function arrayMin(arr: Float64Array | number[]): number {
  let min = Infinity;
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i] ?? Infinity;
    if (v < min) min = v;
  }
  return min;
}

/** Clamp a value to [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Apply log-density color mapping to a pixel buffer from a density array. */
export function applyLogDensityColor(
  data: Uint8ClampedArray,
  density: Float64Array,
  palette: Array<{ r: number; g: number; b: number }>
): void {
  const maxDensity = arrayMax(density);
  if (maxDensity <= 0) return;
  for (let i = 0; i < density.length; i++) {
    const d = density[i] ?? 0;
    if (d > 0) {
      const t = Math.log(d + 1) / Math.log(maxDensity + 1);
      const idx = Math.min(Math.floor(t * (palette.length - 1)), palette.length - 1);
      const col = palette[idx] ?? { r: 20, g: 20, b: 40 };
      data[i * 4] = col.r; data[i * 4 + 1] = col.g; data[i * 4 + 2] = col.b; data[i * 4 + 3] = 255;
    } else {
      data[i * 4] = 248; data[i * 4 + 1] = 248; data[i * 4 + 2] = 255; data[i * 4 + 3] = 255;
    }
  }
}

/** Compute non-background coverage fraction from an RGBA pixel buffer. */
export function computeCoverage(
  data: Uint8ClampedArray,
  width: number,
  height: number
): number {
  let count = 0;
  const total = width * height;
  for (let i = 0; i < total; i++) {
    const r = data[i * 4] ?? 0;
    const g = data[i * 4 + 1] ?? 0;
    const b = data[i * 4 + 2] ?? 0;
    // Count pixel as "covered" if it is not near-white background
    if (r < 240 || g < 240 || b < 240) count++;
  }
  return count / total;
}
