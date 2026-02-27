/**
 * Newton Fractal Generator
 * Newton's method on f(z) = z³ - 1, color by root convergence
 */

import { FractalGenerator, FractalParams, Color, createColorArray, SeededRandom } from '../FractalGenerator';
import { FractalMethod } from '../../shared/types';
import Complex from 'complex.js';

const MAX_ITERATIONS = 64;
const TOLERANCE = 0.001;

// Three roots of z³ - 1 = 0
const ROOT1 = new Complex(1, 0);
const ROOT2 = new Complex(-0.5, Math.sqrt(3) / 2);
const ROOT3 = new Complex(-0.5, -Math.sqrt(3) / 2);

export class NewtonGenerator implements FractalGenerator {
  getMethod(): FractalMethod {
    return 'newton';
  }

  generate(params: FractalParams): Color[][] {
    const { width, height, seed } = params;
    const random = new SeededRandom(seed);
    const colors = createColorArray(width, height);

    const zoom = random.nextFloat(0.8, 1.5);

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const x0 = this.mapToReal(px, width, zoom);
        const y0 = this.mapToImag(py, height, zoom);

        const result = this.runNewtonMethod(x0, y0);
        colors[py][px] = this.resultToColor(result, seed);
      }
    }

    return colors;
  }

  private mapToReal(px: number, width: number, zoom: number): number {
    const range = 3.0 / zoom;
    return ((px / width) - 0.5) * range;
  }

  private mapToImag(py: number, height: number, zoom: number): number {
    const range = 3.0 / zoom;
    return ((py / height) - 0.5) * range;
  }

  private runNewtonMethod(x0: number, y0: number): { root: number; iterations: number } {
    let z = new Complex(x0, y0);

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const fz = this.f(z);
      const fpz = this.fp(z);

      z = z.sub(fz.div(fpz));

      const rootIndex = this.findConvergedRoot(z);
      if (rootIndex !== -1) {
        return { root: rootIndex, iterations: i };
      }
    }

    return { root: -1, iterations: MAX_ITERATIONS };
  }

  private f(z: Complex): Complex {
    // f(z) = z³ - 1
    return z.pow(3).sub(1);
  }

  private fp(z: Complex): Complex {
    // f'(z) = 3z²
    return z.pow(2).mul(3);
  }

  private findConvergedRoot(z: Complex): number {
    if (z.sub(ROOT1).abs() < TOLERANCE) return 0;
    if (z.sub(ROOT2).abs() < TOLERANCE) return 1;
    if (z.sub(ROOT3).abs() < TOLERANCE) return 2;
    return -1;
  }

  private resultToColor(result: { root: number; iterations: number }, _seed: number): Color {
    const baseColors: Color[] = [
      { r: 255, g: 100, b: 100 },
      { r: 100, g: 255, b: 100 },
      { r: 100, g: 100, b: 255 }
    ];

    if (result.root === -1) {
      return { r: 0, g: 0, b: 0 };
    }

    const base = baseColors[result.root];
    const fade = 1 - (result.iterations / MAX_ITERATIONS);

    return {
      r: Math.floor(base.r * fade),
      g: Math.floor(base.g * fade),
      b: Math.floor(base.b * fade)
    };
  }
}
