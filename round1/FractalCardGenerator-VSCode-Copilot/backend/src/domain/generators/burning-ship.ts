/**
 * Burning Ship Fractal Generator
 * Iterates z = (|Re(z)| + i|Im(z)|)² + c
 */

import { FractalParams } from '../../shared/types';
import { IFractalGenerator, PatternData, ColorMapper, validatePatternCoverage } from '../fractal-generator';

const MAX_ITERATION_ATTEMPTS = 3;

export class BurningShipGenerator implements IFractalGenerator {
  generate(params: FractalParams): PatternData {
    let maxIterations = params.maxIterations || 256;
    let pattern: PatternData;
    let attempts = 0;

    do {
      pattern = this.generatePattern(params, maxIterations);
      const validation = this.validateCoverage(pattern);
      
      if (validation.isValid) {
        break;
      }

      maxIterations = Math.floor(maxIterations * 1.5);
      attempts++;
    } while (attempts < MAX_ITERATION_ATTEMPTS);

    return pattern;
  }

  private generatePattern(params: FractalParams, maxIterations: number): PatternData {
    const { width, height, seed } = params;
    const pixels: number[][][] = [];

    // Use seed to vary the view
    const seedNorm = (seed % 1000) / 1000;
    const zoom = 1.8 + seedNorm * 0.5;
    const centerX = -0.45 + (seedNorm - 0.5) * 0.3;
    const centerY = -0.3 + (seedNorm - 0.5) * 0.3;

    for (let py = 0; py < height; py++) {
      const row: number[][] = [];
      for (let px = 0; px < width; px++) {
        const x = centerX + (px / width - 0.5) * zoom;
        const y = centerY + (py / height - 0.5) * zoom;
        
        const iterations = this.calculateIterations(x, y, maxIterations);
        const color = ColorMapper.iterationsToColor(iterations, maxIterations);
        row.push([color[0], color[1], color[2]]);
      }
      pixels.push(row);
    }

    return { pixels, width, height };
  }

  private calculateIterations(cx: number, cy: number, maxIterations: number): number {
    let zx = 0;
    let zy = 0;
    let iterations = 0;

    while (iterations < maxIterations) {
      const zxAbs = Math.abs(zx);
      const zyAbs = Math.abs(zy);
      
      if (zxAbs * zxAbs + zyAbs * zyAbs > 4) {
        break;
      }

      const temp = zxAbs * zxAbs - zyAbs * zyAbs + cx;
      zy = 2 * zxAbs * zyAbs + cy;
      zx = temp;
      iterations++;
    }

    return iterations;
  }

  validateCoverage(pattern: PatternData) {
    return validatePatternCoverage(pattern);
  }
}
