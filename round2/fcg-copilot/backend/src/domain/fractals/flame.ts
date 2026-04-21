/**
 * Flame Fractal generator.
 * Probabilistic IFS with non-linear variation functions.
 * Random transform selection per iteration (not round-robin) per spec §5.3.
 * Warmup of >= 20 iterations before recording per spec §5.3.
 * Log-density mapping per spec §5.3.
 */

import { buildPalette } from '../color/harmony.js';
import type { FractalGenerator, RenderParams, RenderResult } from './types.js';
import { computeCoverage, createPrng, applyLogDensityColor } from './types.js';

/** Total flame iterations. Named constant per spec §3.4. */
const FLAME_ITERS = 500000;
/** Warmup iterations to discard per spec §5.3. */
const FLAME_WARMUP = 20;

/** Non-linear variation: sinusoidal. */
function variationSin(x: number, y: number): [number, number] {
  return [Math.sin(x), Math.sin(y)];
}

/** Non-linear variation: spherical (1/r²). */
function variationSpherical(x: number, y: number): [number, number] {
  const r2 = x * x + y * y || 1e-10;
  return [x / r2, y / r2];
}

/** Non-linear variation: swirl. */
function variationSwirl(x: number, y: number): [number, number] {
  const r2 = x * x + y * y;
  return [x * Math.sin(r2) - y * Math.cos(r2), x * Math.cos(r2) + y * Math.sin(r2)];
}

/** Non-linear variation: horseshoe. */
function variationHorseshoe(x: number, y: number): [number, number] {
  const r = Math.sqrt(x * x + y * y) || 1e-10;
  return [(x - y) * (x + y) / r, 2 * x * y / r];
}

type VariationFn = (x: number, y: number) => [number, number];
const VARIATIONS: VariationFn[] = [variationSin, variationSpherical, variationSwirl, variationHorseshoe];

/** A single flame transform with affine coefficients and a variation. */
interface FlameTransform {
  a: number; b: number; c: number; d: number; e: number; f: number;
  variation: VariationFn;
  weight: number;
}

/** Generate seeded flame transforms. Coefficients are expansive to create chaotic orbits. */
function buildTransforms(prng: () => number, count: number): FlameTransform[] {
  const transforms: FlameTransform[] = [];
  for (let i = 0; i < count; i++) {
    const angle1 = prng() * Math.PI * 2;
    const angle2 = prng() * Math.PI * 2;
    const scale1 = 0.6 + prng() * 0.8;
    const scale2 = 0.6 + prng() * 0.8;
    transforms.push({
      a: scale1 * Math.cos(angle1), b: scale1 * Math.sin(angle1),
      c: -scale2 * Math.sin(angle2), d: scale2 * Math.cos(angle2),
      e: prng() * 2 - 1, f: prng() * 2 - 1,
      variation: VARIATIONS[Math.floor(prng() * VARIATIONS.length)] ?? variationSin,
      weight: 1 / count,
    });
  }
  return transforms;
}

/** Apply one flame transform to (x, y). */
function applyFlame(x: number, y: number, t: FlameTransform): [number, number] {
  const ax = t.a * x + t.b * y + t.e;
  const ay = t.c * x + t.d * y + t.f;
  return t.variation(ax, ay);
}

/** Flame Fractal generator. */
export class FlameGenerator implements FractalGenerator {
  render(params: RenderParams): RenderResult {
    const { width, height, seed, baseHue, colorMode } = params;
    const palette = buildPalette(baseHue, colorMode);
    const density = new Float64Array(width * height);
    const data = new Uint8ClampedArray(width * height * 4);

    const prng = createPrng(seed);
    const transformCount = 3 + Math.floor(prng() * 3);
    const transforms = buildTransforms(prng, transformCount);

    let x = prng() * 2 - 1;
    let y = prng() * 2 - 1;

    for (let i = 0; i < FLAME_WARMUP + FLAME_ITERS; i++) {
      // Random transform selection per spec §5.3 (not round-robin)
      const tIdx = Math.floor(prng() * transforms.length);
      const transform = transforms[tIdx] ?? transforms[0]!;
      [x, y] = applyFlame(x, y, transform);
      if (i < FLAME_WARMUP) continue;

      const px = Math.floor(((x + 2.5) / 5) * width);
      const py = Math.floor(((y + 2.5) / 5) * height);
      if (px >= 0 && px < width && py >= 0 && py < height) {
        density[py * width + px] = (density[py * width + px] ?? 0) + 1;
      }
    }

    applyLogDensityColor(data, density, palette);

    return { data, coverage: computeCoverage(data, width, height) };
  }
}
