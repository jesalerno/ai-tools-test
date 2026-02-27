import { FractalGenerator, FractalOptions } from './FractalGenerator';

/**
 * Newton Fractal Generator
 * Runs Newton's method on f(z) = z³ - 1
 * Colors by which root it converges to and how fast
 */
export class NewtonGenerator implements FractalGenerator {
  private readonly roots = [
    { real: 1, imag: 0 },
    { real: -0.5, imag: Math.sqrt(3) / 2 },
    { real: -0.5, imag: -Math.sqrt(3) / 2 },
  ];

  generate(
    width: number,
    height: number,
    options: FractalOptions = {}
  ): number[][] {
    const maxIterations = options.maxIterations || 50;
    const tolerance = options.tolerance as number ?? 1e-6;
    const zoom = options.zoom as number ?? 1.0;

    const result: number[][] = [];
    const scale = 4.0 / (zoom * Math.min(width, height));

    for (let y = 0; y < height; y++) {
      const row: number[] = [];
      for (let x = 0; x < width; x++) {
        let zReal = (x - width / 2) * scale;
        let zImag = (y - height / 2) * scale;

        let iterations = 0;
        let convergedRoot = -1;

        while (iterations < maxIterations) {
          // f(z) = z³ - 1
          // f'(z) = 3z²
          const zRealSq = zReal * zReal;
          const zImagSq = zImag * zImag;
          const zRealImag = zReal * zImag;

          const fReal = zReal * (zRealSq - 3 * zImagSq) - 1;
          const fImag = zImag * (3 * zRealSq - zImagSq);

          const fPrimeReal = 3 * (zRealSq - zImagSq);
          const fPrimeImag = 6 * zRealImag;
          const fPrimeMagSq = fPrimeReal * fPrimeReal + fPrimeImag * fPrimeImag;

          if (fPrimeMagSq < tolerance) break;

          const newZReal = zReal - (fReal * fPrimeReal + fImag * fPrimeImag) / fPrimeMagSq;
          const newZImag = zImag - (fImag * fPrimeReal - fReal * fPrimeImag) / fPrimeMagSq;

          const diff = Math.abs(newZReal - zReal) + Math.abs(newZImag - zImag);
          zReal = newZReal;
          zImag = newZImag;

          if (diff < tolerance) {
            // Find which root we converged to
            for (let i = 0; i < this.roots.length; i++) {
              const dist = Math.sqrt(
                Math.pow(zReal - this.roots[i].real, 2) +
                Math.pow(zImag - this.roots[i].imag, 2)
              );
              if (dist < tolerance * 10) {
                convergedRoot = i;
                break;
              }
            }
            break;
          }

          iterations++;
        }

        // Color based on root and iterations
        const baseColor = convergedRoot >= 0
          ? (convergedRoot * 85 + 85)
          : Math.floor((iterations / maxIterations) * 255);
        row.push(baseColor);
      }
      result.push(row);
    }

    return result;
  }
}
