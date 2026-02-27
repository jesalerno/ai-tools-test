/**
 * Lyapunov Fractal Generator
 * Compute Lyapunov exponents for logistic map sequences
 */

import { FractalParams } from '../../shared/types';
import { IFractalGenerator, PatternData, validatePatternCoverage } from '../fractal-generator';

const MAX_ITERATION_ATTEMPTS = 3;

export class LyapunovGenerator implements IFractalGenerator {
  generate(params: FractalParams): PatternData {
    let iterations = params.maxIterations || 200;
    let pattern: PatternData;
    let attempts = 0;

    do {
      pattern = this.generatePattern(params, iterations);
      const validation = this.validateCoverage(pattern);
      
      if (validation.isValid) {
        break;
      }

      iterations = Math.floor(iterations * 1.5);
      attempts++;
    } while (attempts < MAX_ITERATION_ATTEMPTS);

    return pattern;
  }

  private generatePattern(params: FractalParams, iterations: number): PatternData {
    const { width, height, seed } = params;
    const pixels: number[][][] = [];

    // Use seed to select sequence
    const sequences = ['AB', 'BA', 'AAB', 'ABB', 'AABB', 'ABAB'];
    const sequence = sequences[seed % sequences.length];

    const aMin = 2.0;
    const aMax = 4.0;
    const bMin = 2.0;
    const bMax = 4.0;

    for (let py = 0; py < height; py++) {
      const row: number[][] = [];
      const b = bMin + (py / height) * (bMax - bMin);

      for (let px = 0; px < width; px++) {
        const a = aMin + (px / width) * (aMax - aMin);
        const lyapunov = this.calculateLyapunov(a, b, sequence, iterations);
        const color = this.lyapunovToColor(lyapunov);
        row.push([color[0], color[1], color[2]]);
      }
      pixels.push(row);
    }

    return { pixels, width, height };
  }

  private calculateLyapunov(a: number, b: number, sequence: string, iterations: number): number {
    let x = 0.5;
    let sum = 0;
    const warmup = 100;

    for (let i = 0; i < warmup + iterations; i++) {
      const r = sequence[i % sequence.length] === 'A' ? a : b;
      x = r * x * (1 - x);

      if (i >= warmup && x > 0 && x < 1) {
        sum += Math.log(Math.abs(r * (1 - 2 * x)));
      }
    }

    return sum / iterations;
  }

  private lyapunovToColor(lyapunov: number): [number, number, number] {
    if (isNaN(lyapunov) || !isFinite(lyapunov)) {
      return [0, 0, 0];
    }

    // Map lyapunov exponent to color
    const normalized = Math.max(-2, Math.min(2, lyapunov));
    const t = (normalized + 2) / 4;

    if (normalized < 0) {
      // Negative (stable) - blue to cyan
      const intensity = Math.round(255 * (1 - t * 0.5));
      return [0, intensity, 255];
    } else {
      // Positive (chaotic) - yellow to red
      const intensity = Math.round(255 * (0.5 + t * 0.5));
      return [255, intensity, 0];
    }
  }

  validateCoverage(pattern: PatternData) {
    return validatePatternCoverage(pattern);
  }
}
