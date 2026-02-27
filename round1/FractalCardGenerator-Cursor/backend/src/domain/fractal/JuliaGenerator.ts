import { FractalGenerator, FractalOptions } from './FractalGenerator';

/**
 * Julia Set Generator
 * Iterates z = z² + c where c is fixed and z starts at each pixel
 */
export class JuliaGenerator implements FractalGenerator {
  generate(
    width: number,
    height: number,
    options: FractalOptions = {}
  ): number[][] {
    const maxIterations = options.maxIterations || 100;
    const escapeRadius = options.escapeRadius || 2.0;
    const cReal = options.cReal as number ?? -0.7269;
    const cImag = options.cImag as number ?? 0.1889;
    const zoom = options.zoom as number ?? 1.0;

    const result: number[][] = [];
    const scale = 4.0 / (zoom * Math.min(width, height));

    for (let y = 0; y < height; y++) {
      const row: number[] = [];
      for (let x = 0; x < width; x++) {
        let zReal = (x - width / 2) * scale;
        let zImag = (y - height / 2) * scale;
        let iterations = 0;

        while (iterations < maxIterations) {
          const zRealSq = zReal * zReal;
          const zImagSq = zImag * zImag;

          if (zRealSq + zImagSq > escapeRadius * escapeRadius) {
            break;
          }

          zImag = 2 * zReal * zImag + cImag;
          zReal = zRealSq - zImagSq + cReal;
          iterations++;
        }

        const color = Math.floor((iterations / maxIterations) * 255);
        row.push(color);
      }
      result.push(row);
    }

    return result;
  }
}
