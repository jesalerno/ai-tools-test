/**
 * Burning Ship Fractal Generator
 * Iterates z = (|Re(z)| + i|Im(z)|)² + c
 */

import { FractalGenerator, FractalParams, Color, createColorArray, valueToColor, SeededRandom } from '../FractalGenerator';
import { FractalMethod } from '../../shared/types';

const MAX_ITERATIONS = 256;
const ESCAPE_RADIUS = 4.0;

export class BurningShipGenerator implements FractalGenerator {
  getMethod(): FractalMethod {
    return 'burning-ship';
  }

  generate(params: FractalParams): Color[][] {
    const { width, height, seed } = params;
    const random = new SeededRandom(seed);
    const colors = createColorArray(width, height);

    const zoom = random.nextFloat(0.3, 1.0);
    const centerX = random.nextFloat(-1.7, -1.0);
    const centerY = random.nextFloat(-0.1, 0.1);

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
    const range = 3.0 / zoom;
    return ((px / width) - 0.5) * range + centerX;
  }

  private mapToImag(py: number, height: number, zoom: number, centerY: number): number {
    const range = 3.0 / zoom;
    return ((py / height) - 0.5) * range + centerY;
  }

  private calculateEscapeIterations(x0: number, y0: number): number {
    let zx = 0;
    let zy = 0;

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const xTemp = zx * zx - zy * zy + x0;
      zy = Math.abs(2 * zx * zy) + y0;
      zx = Math.abs(xTemp);

      if (zx * zx + zy * zy > ESCAPE_RADIUS) {
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
