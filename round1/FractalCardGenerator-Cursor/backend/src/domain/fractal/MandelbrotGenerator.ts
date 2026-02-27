import { FractalGenerator, FractalOptions } from './FractalGenerator';

/**
 * Mandelbrot Set Generator
 * Iterates z = z² + c for each complex pixel c
 */
export class MandelbrotGenerator implements FractalGenerator {
  generate(
    width: number,
    height: number,
    options: FractalOptions = {}
  ): number[][] {
    const maxIterations = options.maxIterations || 100;
    const escapeRadius = options.escapeRadius || 2.0;
    const centerX = options.centerX as number ?? -0.5;
    const centerY = options.centerY as number ?? 0;
    const zoom = options.zoom as number ?? 1.0;

    const result: number[][] = [];
    const scale = 4.0 / (zoom * Math.min(width, height));

    for (let y = 0; y < height; y++) {
      const row: number[] = [];
      for (let x = 0; x < width; x++) {
        const real = (x - width / 2) * scale + centerX;
        const imag = (y - height / 2) * scale + centerY;

        let zReal = 0;
        let zImag = 0;
        let iterations = 0;

        while (iterations < maxIterations) {
          const zRealSq = zReal * zReal;
          const zImagSq = zImag * zImag;

          if (zRealSq + zImagSq > escapeRadius * escapeRadius) {
            break;
          }

          zImag = 2 * zReal * zImag + imag;
          zReal = zRealSq - zImagSq + real;
          iterations++;
        }

        // Color based on iterations (normalized to 0-255)
        const color = Math.floor((iterations / maxIterations) * 255);
        row.push(color);
      }
      result.push(row);
    }

    return result;
  }
}
