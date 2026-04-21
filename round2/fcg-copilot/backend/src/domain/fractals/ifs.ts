/**
 * Iterated Function Systems (IFS) fractal generator.
 * Barnsley Fern or Sierpiński Triangle via chaos game.
 * Log-density color mapping per spec §5.3.
 */

import { buildPalette } from '../color/harmony.js';
import type { FractalGenerator, RenderParams, RenderResult } from './types.js';
import { computeCoverage, createPrng, applyLogDensityColor } from './types.js';

/** Total chaos game iterations. Named constant per spec §3.4. */
const IFS_ITERS = 200000;
const WARMUP_ITERS = 20;

/** Barnsley Fern IFS transforms: [a, b, c, d, e, f, probability]. */
const FERN_TRANSFORMS: Array<[number, number, number, number, number, number, number]> = [
  [0, 0, 0, 0.16, 0, 0, 0.01],
  [0.85, 0.04, -0.04, 0.85, 0, 1.6, 0.85],
  [0.2, -0.26, 0.23, 0.22, 0, 1.6, 0.07],
  [-0.15, 0.28, 0.26, 0.24, 0, 0.44, 0.07],
];

/** Sierpiński Triangle IFS transforms. */
const SIERPINSKI_TRANSFORMS: Array<[number, number, number, number, number, number, number]> = [
  [0.5, 0, 0, 0.5, 0, 0, 0.33],
  [0.5, 0, 0, 0.5, 0.5, 0, 0.33],
  [0.5, 0, 0, 0.5, 0.25, 0.5, 0.34],
];

/** Apply one affine transform: [a,b,c,d,e,f] → [ax+by+e, cx+dy+f]. */
function applyTransform(
  x: number,
  y: number,
  t: [number, number, number, number, number, number, number]
): [number, number] {
  return [t[0] * x + t[1] * y + t[4], t[2] * x + t[3] * y + t[5]];
}

/** Select transform index by cumulative probability. */
function selectTransform(
  r: number,
  transforms: Array<[number, number, number, number, number, number, number]>
): number {
  let cumulative = 0;
  for (let i = 0; i < transforms.length; i++) {
    cumulative += transforms[i]?.[6] ?? 0;
    if (r < cumulative) return i;
  }
  return transforms.length - 1;
}

/** IFS fractal generator. */
export class IfsGenerator implements FractalGenerator {
  render(params: RenderParams): RenderResult {
    const { width, height, seed, baseHue, colorMode } = params;
    const palette = buildPalette(baseHue, colorMode);
    const density = new Float64Array(width * height);
    const data = new Uint8ClampedArray(width * height * 4);

    const prng = createPrng(seed);
    const useFern = prng() > 0.5;
    const transforms = useFern ? FERN_TRANSFORMS : SIERPINSKI_TRANSFORMS;

    let x = 0;
    let y = 0;

    // Chaos game with warmup per spec §3.4 / §5.3
    for (let i = 0; i < WARMUP_ITERS + IFS_ITERS; i++) {
      const tIdx = selectTransform(prng(), transforms);
      const transform = transforms[tIdx] ?? transforms[0]!;
      [x, y] = applyTransform(x, y, transform);
      if (i < WARMUP_ITERS) continue;

      // Map IFS coordinates to pixel space
      const px = Math.floor(((x + 3) / 6) * width);
      const py = Math.floor((1 - (y + 1) / 12) * height);
      if (px >= 0 && px < width && py >= 0 && py < height) {
        density[py * width + px] = (density[py * width + px] ?? 0) + 1;
      }
    }

    // Log-density color mapping per spec §5.3
    applyLogDensityColor(data, density, palette);

    return { data, coverage: computeCoverage(data, width, height) };
  }
}
