/**
 * Strange Attractors fractal generator.
 * Lorenz, Clifford, or de Jong attractors with alpha blending for density.
 * Log-density color mapping per spec §5.3.
 */

import { buildPalette } from '../color/harmony.js';
import type { FractalGenerator, RenderParams, RenderResult } from './types.js';
import { computeCoverage, createPrng, applyLogDensityColor } from './types.js';

/** Total attractor iterations. Named constant per spec §3.4. */
const ATTRACTOR_ITERS = 500000;
const WARMUP = 1000;

/** Attractor constants. */
interface AttractorCoeffs { a: number; b: number; c: number; d: number }

/** Clifford attractor step: x' = sin(a*y) + c*cos(a*x), y' = sin(b*x) + d*cos(b*y). */
function cliffordStep(x: number, y: number, p: AttractorCoeffs): [number, number] {
  return [
    Math.sin(p.a * y) + p.c * Math.cos(p.a * x),
    Math.sin(p.b * x) + p.d * Math.cos(p.b * y),
  ];
}

/** De Jong attractor step: x' = sin(a*y) - cos(b*x), y' = sin(c*x) - cos(d*y). */
function deJongStep(x: number, y: number, p: AttractorCoeffs): [number, number] {
  return [
    Math.sin(p.a * y) - Math.cos(p.b * x),
    Math.sin(p.c * x) - Math.cos(p.d * y),
  ];
}

/** Generate seeded attractor parameters in range [-3, 3]. */
function attractorParams(prng: () => number): AttractorCoeffs {
  const rand = () => prng() * 6 - 3;
  return { a: rand(), b: rand(), c: rand(), d: rand() };
}

/** Strange Attractor generator. */
export class StrangeAttractorGenerator implements FractalGenerator {
  render(params: RenderParams): RenderResult {
    const { width, height, seed, baseHue, colorMode } = params;
    const palette = buildPalette(baseHue, colorMode);
    const density = new Float64Array(width * height);
    const data = new Uint8ClampedArray(width * height * 4);

    const prng = createPrng(seed);
    const useDeJong = prng() > 0.5;
    const p = attractorParams(prng);

    let x = 0.1;
    let y = 0.1;

    for (let i = 0; i < WARMUP + ATTRACTOR_ITERS; i++) {
      [x, y] = useDeJong ? deJongStep(x, y, p) : cliffordStep(x, y, p);
      if (i < WARMUP) continue;

      // Map to pixel space: attractor coordinates are roughly in [-3, 3]
      const px = Math.floor(((x + 3) / 6) * width);
      const py = Math.floor(((y + 3) / 6) * height);
      if (px >= 0 && px < width && py >= 0 && py < height) {
        density[py * width + px] = (density[py * width + px] ?? 0) + 1;
      }
    }

    // Log-density mapping with gamma per spec §5.3
    applyLogDensityColor(data, density, palette);

    return { data, coverage: computeCoverage(data, width, height) };
  }
}
