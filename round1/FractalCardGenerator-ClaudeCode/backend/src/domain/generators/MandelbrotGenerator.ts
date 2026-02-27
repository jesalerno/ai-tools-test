/**
 * Mandelbrot Set Generator
 * Iterates z = z² + c for each complex pixel c
 */

import { FractalGenerator, FractalParams, Color, createColorArray, valueToColor, SeededRandom } from '../FractalGenerator';
import { FractalMethod } from '../../shared/types';
import Complex from 'complex.js';

const MAX_ITERATIONS = 256;
const ESCAPE_RADIUS = 2.0;

export class MandelbrotGenerator implements FractalGenerator {
  getMethod(): FractalMethod {
    return 'mandelbrot';
  }

  generate(params: FractalParams): Color[][] {
    const { width, height, seed } = params;
    const random = new SeededRandom(seed);
    const colors = createColorArray(width, height);

    // Random zoom and center for variety
    const zoom = random.nextFloat(0.5, 2.0);
    const centerX = random.nextFloat(-0.5, 0.5);
    const centerY = random.nextFloat(-0.5, 0.5);

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const x0 = this.mapToReal(px, width, zoom, centerX);
        const y0 = this.mapToImag(py, height, zoom, centerY);

        const iterations = this.calculateEscapeIterations(x0, y0);
        const normalizedValue = this.normalizeIterations(iterations);

        colors[py][px] = valueToColor(normalizedValue, seed);
      }
    }

    return colors;
  }

  private mapToReal(px: number, width: number, zoom: number, centerX: number): number {
    const range = 3.5 / zoom;
    return ((px / width) - 0.5) * range + centerX;
  }

  private mapToImag(py: number, height: number, zoom: number, centerY: number): number {
    const range = 3.5 / zoom;
    return ((py / height) - 0.5) * range + centerY;
  }

  private calculateEscapeIterations(x0: number, y0: number): number {
    let z = new Complex(0, 0);
    const c = new Complex(x0, y0);

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
