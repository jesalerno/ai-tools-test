import { FractalGenerator, FractalOptions } from './FractalGenerator';

/**
 * Complex Function Phase Plot Generator
 * For each complex point z, compute f(z) and map argument/magnitude to color
 */
export class PhasePlotGenerator implements FractalGenerator {
  generate(
    width: number,
    height: number,
    options: FractalOptions = {}
  ): number[][] {
    const functionType = options.functionType as string ?? 'exp';
    const zoom = options.zoom as number ?? 1.0;

    const result: number[][] = [];
    const scale = 4.0 / (zoom * Math.min(width, height));

    for (let y = 0; y < height; y++) {
      const row: number[] = [];
      for (let x = 0; x < width; x++) {
        const real = (x - width / 2) * scale;
        const imag = (y - height / 2) * scale;

        let fReal: number, fImag: number;

        if (functionType === 'exp') {
          // f(z) = e^z
          const expReal = Math.exp(real);
          fReal = expReal * Math.cos(imag);
          fImag = expReal * Math.sin(imag);
        } else if (functionType === 'sin') {
          // f(z) = sin(z)
          fReal = Math.sin(real) * Math.cosh(imag);
          fImag = Math.cos(real) * Math.sinh(imag);
        } else {
          // f(z) = z^2
          fReal = real * real - imag * imag;
          fImag = 2 * real * imag;
        }

        // Map argument (phase) to hue, magnitude to brightness
        const magnitude = Math.sqrt(fReal * fReal + fImag * fImag);
        const argument = Math.atan2(fImag, fReal);

        // Convert to grayscale (can be enhanced with color mapping)
        const phase = ((argument + Math.PI) / (2 * Math.PI)) * 255;
        const mag = Math.min(255, magnitude * 50);

        // Combine phase and magnitude
        const color = Math.floor((phase + mag) / 2);
        row.push(color);
      }
      result.push(row);
    }

    return result;
  }
}
