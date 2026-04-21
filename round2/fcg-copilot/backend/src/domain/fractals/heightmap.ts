/**
 * Escape-Time Heightmap fractal generator.
 * Simplex-style noise-based heightmap; full-domain sampling.
 * Log-mapped palette per spec §5.3.
 */

import { buildPalette, writePixel, logMapColor } from '../color/harmony.js';
import type { FractalGenerator, RenderParams, RenderResult } from './types.js';
import { computeCoverage, createPrng } from './types.js';

/** Permutation table size. Named constant per spec §3.4. */
const PERM_SIZE = 256;

/** Simple value noise using a seeded permutation table. */
function buildPermTable(seed: number): Uint8Array {
  const perm = new Uint8Array(PERM_SIZE * 2);
  // Fisher-Yates shuffle with seeded PRNG
  for (let i = 0; i < PERM_SIZE; i++) perm[i] = i;
  let s = seed >>> 0;
  for (let i = PERM_SIZE - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    const tmp = perm[i] ?? 0;
    perm[i] = perm[j] ?? 0;
    perm[j] = tmp;
  }
  for (let i = 0; i < PERM_SIZE; i++) perm[i + PERM_SIZE] = perm[i] ?? 0;
  return perm;
}

/** Gradient vectors for 2D Perlin-style noise. */
const GRAD2: Array<[number, number]> = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [-1, 1], [1, -1], [-1, -1],
];

/** Smoothstep fade function. */
function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/** Linear interpolation. */
function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

/** Single octave 2D gradient noise in [0, 1]. */
function noise2d(x: number, y: number, perm: Uint8Array): number {
  const xi = Math.floor(x) & (PERM_SIZE - 1);
  const yi = Math.floor(y) & (PERM_SIZE - 1);
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const u = fade(xf);
  const v = fade(yf);

  const g = (xi2: number, yi2: number, gx: number, gy: number): number => {
    const idx = (perm[(xi2 & (PERM_SIZE - 1)) + (perm[yi2 & (PERM_SIZE - 1)] ?? 0)] ?? 0) & 7;
    const grad = GRAD2[idx] ?? [1, 0];
    return grad[0] * gx + grad[1] * gy;
  };

  const n00 = g(xi, yi, xf, yf);
  const n10 = g(xi + 1, yi, xf - 1, yf);
  const n01 = g(xi, yi + 1, xf, yf - 1);
  const n11 = g(xi + 1, yi + 1, xf - 1, yf - 1);

  return (lerp(lerp(n00, n10, u), lerp(n01, n11, u), v) + 1) / 2;
}

/** Sample fractional Brownian motion (fBm) with multiple octaves. */
function fbm(x: number, y: number, perm: Uint8Array, octaves: number): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < octaves; i++) {
    value += noise2d(x * frequency, y * frequency, perm) * amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value;
}

/** Heightmap fractal generator. */
export class HeightmapGenerator implements FractalGenerator {
  render(params: RenderParams): RenderResult {
    const { width, height, zoom, seed, baseHue, colorMode } = params;
    const palette = buildPalette(baseHue, colorMode);
    const data = new Uint8ClampedArray(width * height * 4);
    const perm = buildPermTable(seed);

    const prng = createPrng(seed);
    const offsetX = prng() * 100;
    const offsetY = prng() * 100;
    const octaves = 6;
    const scale = 3.0 / zoom;

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const nx = offsetX + (px / width) * scale;
        const ny = offsetY + (py / height) * scale;
        const t = fbm(nx, ny, perm, octaves);
        writePixel(data, (py * width + px) * 4, logMapColor(t, palette));
      }
    }

    return { data, coverage: computeCoverage(data, width, height) };
  }
}
