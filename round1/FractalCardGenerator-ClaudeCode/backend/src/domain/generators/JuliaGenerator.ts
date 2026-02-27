/**
 * Julia Set Generator
 * Iterates z = z² + c where c is fixed
 */

import { FractalGenerator, FractalParams, Color, createColorArray, valueToColor, SeededRandom } from '../FractalGenerator';
import { FractalMethod } from '../../shared/types';
import Complex from 'complex.js';

const MAX_ITERATIONS = 256;
const ESCAPE_RADIUS = 2.0;

export class JuliaGenerator implements FractalGenerator {
  getMethod(): FractalMethod {
    return 'julia';
  }

  generate(params: FractalParams): Color[][] {
    const { width, height, seed } = params;
    const random = new SeededRandom(seed);
    const colors = createColorArray(width, height);

    // Random c parameter for Julia set
    const cReal = random.nextFloat(-0.8, 0.8);
    const cImag = random.nextFloat(-0.8, 0.8);
    const c = new Complex(cReal, cImag);

    const zoom = random.nextFloat(0.8, 1.5);

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const x0 = this.mapToReal(px, width, zoom);
        const y0 = this.mapToImag(py, height, zoom);

        const iterations = this.calculateEscapeIterations(x0, y0, c);
        const normalizedValue = this.normalizeIterations(iterations);

        colors[py][px] = valueToColor(normalizedValue, seed);
      }
    }

    return colors;
  }

  private mapToReal(px: number, width: number, zoom: number): number {
    const range = 4.0 / zoom;
    return ((px / width) - 0.5) * range;
  }

  private mapToImag(py: number, height: number, zoom: number): number {
    const range = 4.0 / zoom;
    return ((py / height) - 0.5) * range;
  }

  private calculateEscapeIterations(x0: number, y0: number, c: Complex): number {
    let z = new Complex(x0, y0);

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      z = z.mul(z).add(c);

      if (z.abs() > ESCAPE_RADIUS) {
        return i;
      }
    }

    return MAX_ITERATIONS;
  }

  private normalizeIterations(iterations: number): number {
    if (iterations === MAX_ITERATIONS) {
      return 0;
    }
    return iterations / MAX_ITERATIONS;
  }
}
