/**
 * Julia Set fractal generator.
 * Iterate z = z² + c where c is fixed; z starts at each pixel coordinate.
 * Log-mapped palette per spec §5.3.
 */

import { buildPalette, writePixel, logMapColor } from '../color/harmony.js';
import type { FractalGenerator, RenderParams, RenderResult } from './types.js';
import { computeCoverage, createPrng } from './types.js';

const MAX_ITER_CAP = 2000;

/** Interesting Julia Set c-values for variety. */
const JULIA_C_VALUES: Array<[number, number]> = [
  [-0.7269, 0.1889],
  [-0.4, 0.6],
  [0.285, 0.01],
  [-0.835, -0.2321],
  [-0.8, 0.156],
  [0.45, -0.1428],
  [-0.70176, -0.3842],
  [0.355, 0.355],
];

/** Render one Julia Set pixel. Returns escape iteration or 0 for inside. */
function juliaIter(zx: number, zy: number, cx: number, cy: number, maxIter: number): number {
  for (let i = 0; i < maxIter; i++) {
    const zx2 = zx * zx;
    const zy2 = zy * zy;
    if (zx2 + zy2 > 4) return i;
    zy = 2 * zx * zy + cy;
    zx = zx2 - zy2 + cx;
  }
  return 0;
}

/** Julia Sets generator implementation. */
export class JuliaGenerator implements FractalGenerator {
  render(params: RenderParams): RenderResult {
    const { width, height, iterations, zoom, seed, baseHue, colorMode } = params;
    const maxIter = Math.min(iterations, MAX_ITER_CAP);
    const palette = buildPalette(baseHue, colorMode);
    const data = new Uint8ClampedArray(width * height * 4);

    const prng = createPrng(seed);
    const cIdx = Math.floor(prng() * JULIA_C_VALUES.length);
    const [cx, cy] = JULIA_C_VALUES[cIdx] ?? [-0.7269, 0.1889];
    const scale = 3.5 / zoom;

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const zx = (px / width - 0.5) * scale;
        const zy = (py / height - 0.5) * scale * (height / width);
        const iter = juliaIter(zx, zy, cx, cy, maxIter);
        const offset = (py * width + px) * 4;

        if (iter === 0) {
          const base = palette[0] ?? { r: 10, g: 10, b: 20 };
          writePixel(data, offset, { r: Math.max(5, base.r >> 4), g: Math.max(5, base.g >> 4), b: Math.max(8, base.b >> 3) });
        } else {
          const t = Math.log(iter + 1) / Math.log(maxIter + 1);
          writePixel(data, offset, logMapColor(t, palette));
        }
      }
    }

    return { data, coverage: computeCoverage(data, width, height) };
  }
}
