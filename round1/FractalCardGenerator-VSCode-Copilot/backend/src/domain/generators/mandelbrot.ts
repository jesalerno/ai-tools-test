/**
 * Mandelbrot Set Fractal Generator
 * Iterates z = z² + c for each complex pixel c
 */

import Complex from 'complex.js';
import { FractalParams } from '../../shared/types';
import { IFractalGenerator, PatternData, ColorMapper, validatePatternCoverage } from '../fractal-generator';
const MAX_ITERATION_ATTEMPTS = 3;

export class MandelbrotGenerator implements IFractalGenerator {
  generate(params: FractalParams): PatternData {
    let maxIterations = params.maxIterations || 256;
    let pattern: PatternData;
    let attempts = 0;

    // Adaptive iteration: increase if coverage is insufficient
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

    // Use seed to vary the view window
    const seedNorm = (seed % 1000) / 1000;
    const zoom = 1.5 + seedNorm * 1.5;
    const centerX = -0.5 + (seedNorm - 0.5) * 0.5;
    const centerY = 0.0 + (seedNorm - 0.5) * 0.5;

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
    let z = new Complex(0, 0);
    const c = new Complex(cx, cy);
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
