import { FractalGenerator, FractalOptions } from './FractalGenerator';

/**
 * Lyapunov Fractal Generator
 * Computes Lyapunov exponents for logistic map sequences
 */
export class LyapunovGenerator implements FractalGenerator {
  generate(
    width: number,
    height: number,
    options: FractalOptions = {}
  ): number[][] {
    const iterations = options.maxIterations as number ?? 100;
    const sequenceLength = options.sequenceLength as number ?? 10;
    const aMin = options.aMin as number ?? 2.0;
    const aMax = options.aMax as number ?? 4.0;
    const bMin = options.bMin as number ?? 2.0;
    const bMax = options.bMax as number ?? 4.0;

    const result: number[][] = [];
    const sequence: number[] = [];

    // Generate sequence pattern (ABAB...)
    for (let i = 0; i < sequenceLength; i++) {
      sequence.push(i % 2 === 0 ? 0 : 1);
    }

    for (let y = 0; y < height; y++) {
      const row: number[] = [];
      const b = bMin + (bMax - bMin) * (y / height);

      for (let x = 0; x < width; x++) {
        const a = aMin + (aMax - aMin) * (x / width);

        let xVal = 0.5;
        let sum = 0;

        for (let i = 0; i < iterations; i++) {
          const r = sequence[i % sequence.length] === 0 ? a : b;
          xVal = r * xVal * (1 - xVal);

          if (xVal <= 0 || xVal >= 1) {
            sum = -10;
            break;
          }

          sum += Math.log(Math.abs(r * (1 - 2 * xVal)));
        }

        const lyapunov = sum / iterations;
        // Normalize to 0-255 range
        const normalized = Math.max(0, Math.min(255, (lyapunov + 2) * 63.75));
        row.push(Math.floor(normalized));
      }
      result.push(row);
    }

    return result;
  }
}
