/**
 * Mandelbrot Set fractal generator.
 * Iterate z = z² + c; color by escape iteration count with log mapping.
 */

import { buildPalette, writePixel, logMapColor } from '../color/harmony.js';
import type { FractalGenerator, RenderParams, RenderResult } from './types.js';
import { computeCoverage } from './types.js';

/** Maximum iteration count constant — required by spec §3.4. */
const MAX_ITER_CAP = 2000;

/** Render one pixel of the Mandelbrot set. Returns escape iteration (0 = inside). */
function mandelbrotIter(
  cx: number,
  cy: number,
  maxIter: number
): number {
  let zx = 0;
  let zy = 0;
  for (let i = 0; i < maxIter; i++) {
    const zx2 = zx * zx;
    const zy2 = zy * zy;
    if (zx2 + zy2 > 4) return i;
    zy = 2 * zx * zy + cy;
    zx = zx2 - zy2 + cx;
  }
  return 0; // inside set
}

/** Mandelbrot Set generator implementation. */
export class MandelbrotGenerator implements FractalGenerator {
  render(params: RenderParams): RenderResult {
    const { width, height, iterations, zoom, seed, baseHue, colorMode } = params;
    const maxIter = Math.min(iterations, MAX_ITER_CAP);
    const palette = buildPalette(baseHue, colorMode);
    const data = new Uint8ClampedArray(width * height * 4);

    // Viewport center varies slightly per seed for variety
    const cx = -0.5 + ((seed % 100) / 100 - 0.5) * 0.4;
    const cy = 0 + ((Math.floor(seed / 100) % 100) / 100 - 0.5) * 0.3;
    const scale = 3.5 / zoom;

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const x = cx + (px / width - 0.5) * scale;
        const y = cy + (py / height - 0.5) * scale * (height / width);
        const iter = mandelbrotIter(x, y, maxIter);
        const offset = (py * width + px) * 4;

        if (iter === 0) {
          // Inside set: use dark palette tint
          const base = palette[0] ?? { r: 10, g: 10, b: 20 };
          writePixel(data, offset, { r: Math.max(5, base.r >> 4), g: Math.max(5, base.g >> 4), b: Math.max(8, base.b >> 3) });
        } else {
          // Log-mapped coloring per spec §5.3
          const t = Math.log(iter + 1) / Math.log(maxIter + 1);
          writePixel(data, offset, logMapColor(t, palette));
        }
      }
    }

    return { data, coverage: computeCoverage(data, width, height) };
  }
}
