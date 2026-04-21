/**
 * Newton Fractal generator.
 * Apply Newton's method to f(z) = z³ - 1; color by root basin + iteration count.
 * Cyclic palette per root basin per spec §5.3.
 */

import { buildPalette, writePixel } from '../color/harmony.js';
import type { FractalGenerator, RenderParams, RenderResult } from './types.js';
import { computeCoverage } from './types.js';

const MAX_ITER_CAP = 2000;
const TOLERANCE = 1e-6;
/** Stride for cyclic palette indexing per root. */
const PALETTE_STRIDE = 32;

/** Roots of z³ - 1 = 0 (cube roots of unity). */
const ROOTS: Array<[number, number]> = [
  [1, 0],
  [-0.5, Math.sqrt(3) / 2],
  [-0.5, -Math.sqrt(3) / 2],
];

/** Distance between two complex numbers. */
function dist(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Complex division: (ax + i*ay) / (bx + i*by). */
function complexDiv(ax: number, ay: number, bx: number, by: number): [number, number] {
  const denom = bx * bx + by * by;
  return [(ax * bx + ay * by) / denom, (ay * bx - ax * by) / denom];
}

/** Newton iteration for f(z) = z³ - 1, f'(z) = 3z². Returns [rootIndex, iter]. */
function newtonIter(zx: number, zy: number, maxIter: number): [number, number] {
  let x = zx;
  let y = zy;

  for (let i = 0; i < maxIter; i++) {
    // f(z) = z³ - 1
    const x2 = x * x;
    const y2 = y * y;
    const x3 = x2 * x - 3 * x * y2;
    const y3 = 3 * x2 * y - y2 * y;
    const fx = x3 - 1;
    const fy = y3;
    // f'(z) = 3z²
    const fpx = 3 * (x2 - y2);
    const fpy = 6 * x * y;
    const [dx, dy] = complexDiv(fx, fy, fpx, fpy);
    x -= dx;
    y -= dy;

    for (let r = 0; r < ROOTS.length; r++) {
      const [rx, ry] = ROOTS[r] ?? [0, 0];
      if (dist(x, y, rx, ry) < TOLERANCE) return [r, i];
    }
  }
  return [0, maxIter];
}

/** Newton Fractal generator. */
export class NewtonGenerator implements FractalGenerator {
  render(params: RenderParams): RenderResult {
    const { width, height, iterations, zoom, seed, baseHue, colorMode } = params;
    const maxIter = Math.min(iterations, MAX_ITER_CAP);
    const palette = buildPalette(baseHue, colorMode, 128);
    const data = new Uint8ClampedArray(width * height * 4);
    const scale = 3.0 / zoom;
    const cx = ((seed % 100) / 100 - 0.5) * 0.2;
    const cy = ((Math.floor(seed / 100) % 100) / 100 - 0.5) * 0.2;

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const zx = cx + (px / width - 0.5) * scale;
        const zy = cy + (py / height - 0.5) * scale * (height / width);
        const [rootIdx, iter] = newtonIter(zx, zy, maxIter);
        // Cyclic palette per root basin per spec §5.3
        const paletteIdx = (rootIdx * PALETTE_STRIDE + (iter % PALETTE_STRIDE)) % palette.length;
        writePixel(data, (py * width + px) * 4, palette[paletteIdx] ?? { r: 20, g: 20, b: 40 });
      }
    }

    return { data, coverage: computeCoverage(data, width, height) };
  }
}
