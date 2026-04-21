/**
 * Burning Ship Fractal generator.
 * Iterate z = (|Re(z)| + i|Im(z)|)² + c; color by escape iteration count.
 * Log-mapped palette per spec §5.3.
 */

import { buildPalette, writePixel, logMapColor } from '../color/harmony.js';
import type { FractalGenerator, RenderParams, RenderResult } from './types.js';
import { computeCoverage } from './types.js';

const MAX_ITER_CAP = 2000;

/** Burning Ship escape iteration count for pixel (cx, cy). */
function burningShipIter(cx: number, cy: number, maxIter: number): number {
  let zx = 0;
  let zy = 0;
  for (let i = 0; i < maxIter; i++) {
    const zx2 = zx * zx;
    const zy2 = zy * zy;
    if (zx2 + zy2 > 4) return i;
    // Apply absolute values before squaring
    zy = 2 * Math.abs(zx) * Math.abs(zy) + cy;
    zx = zx2 - zy2 + cx;
  }
  return 0;
}

/** Burning Ship Fractal generator. */
export class BurningShipGenerator implements FractalGenerator {
  render(params: RenderParams): RenderResult {
    const { width, height, iterations, zoom, seed, baseHue, colorMode } = params;
    const maxIter = Math.min(iterations, MAX_ITER_CAP);
    const palette = buildPalette(baseHue, colorMode);
    const data = new Uint8ClampedArray(width * height * 4);

    // Classic Burning Ship viewport centered near (-1.75, -0.05)
    const viewCx = -1.75 + ((seed % 50) / 50 - 0.5) * 0.3;
    const viewCy = -0.05 + ((Math.floor(seed / 50) % 50) / 50 - 0.5) * 0.2;
    const scale = 3.0 / zoom;

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const cx = viewCx + (px / width - 0.5) * scale;
        const cy = viewCy + (py / height - 0.5) * scale * (height / width);
        const iter = burningShipIter(cx, cy, maxIter);
        const offset = (py * width + px) * 4;

        if (iter === 0) {
          const base = palette[0] ?? { r: 10, g: 5, b: 5 };
          writePixel(data, offset, { r: Math.max(8, base.r >> 3), g: Math.max(5, base.g >> 4), b: Math.max(5, base.b >> 4) });
        } else {
          const t = Math.log(iter + 1) / Math.log(maxIter + 1);
          writePixel(data, offset, logMapColor(t, palette));
        }
      }
    }

    return { data, coverage: computeCoverage(data, width, height) };
  }
}
