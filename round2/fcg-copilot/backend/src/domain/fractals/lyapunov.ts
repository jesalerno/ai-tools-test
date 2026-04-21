/**
 * Lyapunov Fractal generator.
 * Compute Lyapunov exponents for logistic map sequences.
 * Stable regions use dark palette tint; chaotic regions use full palette.
 * Per spec §5.3: stable regions must NOT render as solid black.
 */

import { buildPalette, writePixel, darkTint } from '../color/harmony.js';
import type { FractalGenerator, RenderParams, RenderResult } from './types.js';
import { computeCoverage, createPrng } from './types.js';

/** Symbolic sequences providing variety across seeds per spec §5.3. */
const SEQUENCES: number[][] = [
  [0, 1],
  [0, 0, 1],
  [0, 1, 1],
  [0, 1, 0, 1],
  [0, 0, 1, 1],
];

/** Compute Lyapunov exponent for parameters (a, b) with given sequence. */
function lyapunovExponent(
  a: number,
  b: number,
  seq: number[],
  maxIter: number
): number {
  let x = 0.5;
  let sum = 0;
  const warmup = 100;

  for (let i = 0; i < warmup + maxIter; i++) {
    const r = seq[i % seq.length] === 0 ? a : b;
    x = r * x * (1 - x);
    if (i >= warmup) {
      const absVal = Math.abs(r - 2 * r * x);
      sum += absVal < 1e-10 ? -10 : Math.log(absVal);
    }
  }
  return sum / maxIter;
}

/** Lyapunov Fractal generator. */
export class LyapunovGenerator implements FractalGenerator {
  render(params: RenderParams): RenderResult {
    const { width, height, iterations, seed, baseHue, colorMode } = params;
    const maxIter = Math.min(Math.floor(iterations / 4), 500);
    const palette = buildPalette(baseHue, colorMode);
    const data = new Uint8ClampedArray(width * height * 4);

    const prng = createPrng(seed);
    const seqIdx = Math.floor(prng() * SEQUENCES.length);
    const seq = SEQUENCES[seqIdx] ?? [0, 1];

    // Sample r-values in [2.5, 4.0] range for rich Lyapunov structures
    const aMin = 2.5 + prng() * 0.5;
    const bMin = 2.5 + prng() * 0.5;

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const a = aMin + (px / width) * 1.5;
        const b = bMin + (py / height) * 1.5;
        const exponent = lyapunovExponent(a, b, seq, maxIter);
        const offset = (py * width + px) * 4;

        if (exponent >= 0) {
          // Chaotic region: use positive exponent mapped to palette
          const t = Math.min(exponent / 2.0, 1.0);
          const logT = Math.log(t * (Math.E - 1) + 1);
          const idx = Math.min(Math.floor(logT * (palette.length - 1)), palette.length - 1);
          writePixel(data, offset, palette[idx] ?? { r: 20, g: 20, b: 20 });
        } else {
          // Stable region: dark palette tint per spec §5.3 (no solid black)
          const t = Math.min(Math.abs(exponent) / 5.0, 1.0);
          const idx = Math.min(Math.floor(t * (palette.length - 1)), palette.length - 1);
          writePixel(data, offset, darkTint(palette[idx] ?? { r: 30, g: 30, b: 60 }, 0.2));
        }
      }
    }

    return { data, coverage: computeCoverage(data, width, height) };
  }
}
