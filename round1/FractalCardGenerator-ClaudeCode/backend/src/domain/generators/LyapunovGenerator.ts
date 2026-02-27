/**
 * Lyapunov Fractal Generator
 * Compute Lyapunov exponents for logistic map sequences
 */

import { FractalGenerator, FractalParams, Color, createColorArray, valueToColor, SeededRandom } from '../FractalGenerator';
import { FractalMethod } from '../../shared/types';

const ITERATIONS = 256;
const WARMUP_ITERATIONS = 64;

export class LyapunovGenerator implements FractalGenerator {
  private sequence: string;

  constructor() {
    this.sequence = 'AB';
  }

  getMethod(): FractalMethod {
    return 'lyapunov';
  }

  generate(params: FractalParams): Color[][] {
    const { width, height, seed } = params;
    const random = new SeededRandom(seed);
    const colors = createColorArray(width, height);

    // Random sequence pattern
    const sequences = ['AB', 'AABB', 'ABAB', 'AAAB', 'BBBAB'];
    this.sequence = sequences[random.nextInt(0, sequences.length - 1)];

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const a = this.mapParameter(px, width);
        const b = this.mapParameter(py, height);

        const lyapunov = this.calculateLyapunov(a, b);
        const normalizedValue = this.normalizeLyapunov(lyapunov);

        colors[py][px] = valueToColor(normalizedValue, seed);
      }
    }

    return colors;
  }

  private mapParameter(p: number, size: number): number {
    const minParam = 2.0;
    const maxParam = 4.0;
    return minParam + (p / size) * (maxParam - minParam);
  }

  private calculateLyapunov(a: number, b: number): number {
    let x = 0.5;
    let sum = 0;

    // Warmup iterations
    for (let i = 0; i < WARMUP_ITERATIONS; i++) {
      const r = this.getParameterForIteration(i, a, b);
      x = this.logisticMap(r, x);
    }

    // Calculate Lyapunov exponent
    for (let i = 0; i < ITERATIONS; i++) {
      const r = this.getParameterForIteration(i, a, b);
      x = this.logisticMap(r, x);
      sum += Math.log(Math.abs(r * (1 - 2 * x)));
    }

    return sum / ITERATIONS;
  }

  private logisticMap(r: number, x: number): number {
    return r * x * (1 - x);
  }

  private getParameterForIteration(iteration: number, a: number, b: number): number {
    const char = this.sequence[iteration % this.sequence.length];
    return char === 'A' ? a : b;
  }

  private normalizeLyapunov(lyapunov: number): number {
    const minLyapunov = -2.0;
    const maxLyapunov = 1.0;

    const clamped = Math.max(minLyapunov, Math.min(maxLyapunov, lyapunov));
    return (clamped - minLyapunov) / (maxLyapunov - minLyapunov);
  }
}
