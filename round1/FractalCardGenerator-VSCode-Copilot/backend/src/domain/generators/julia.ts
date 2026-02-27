/**
 * Julia Set Fractal Generator
 * Iterates z = z² + c where c is fixed
 */

import Complex from 'complex.js';
import { FractalParams } from '../../shared/types';
import { IFractalGenerator, PatternData, ColorMapper, validatePatternCoverage } from '../fractal-generator';

const MAX_ITERATION_ATTEMPTS = 3;

export class JuliaGenerator implements IFractalGenerator {
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

    // Use seed to select Julia set parameter c
    const seedNorm = (seed % 1000) / 1000;
    const angle = seedNorm * 2 * Math.PI;
    const radius = 0.7885;
    const cx = radius * Math.cos(angle);
    const cy = radius * Math.sin(angle);
    const c = new Complex(cx, cy);

    const zoom = 1.5;

    for (let py = 0; py < height; py++) {
      const row: number[][] = [];
      for (let px = 0; px < width; px++) {
        const x = (px / width - 0.5) * zoom;
        const y = (py / height - 0.5) * zoom;
        
        const iterations = this.calculateIterations(x, y, c, maxIterations);
        const color = ColorMapper.iterationsToColor(iterations, maxIterations);
        row.push([color[0], color[1], color[2]]);
      }
      pixels.push(row);
    }

    return { pixels, width, height };
  }

  private calculateIterations(zx: number, zy: number, c: Complex, maxIterations: number): number {
    let z = new Complex(zx, zy);
    let iterations = 0;

    while (iterations < maxIterations && z.abs() < 2) {
      z = z.mul(z).add(c);
      iterations++;
    }

    return iterations;
  }

  validateCoverage(pattern: PatternData) {
    return validatePatternCoverage(pattern);
  }
}
