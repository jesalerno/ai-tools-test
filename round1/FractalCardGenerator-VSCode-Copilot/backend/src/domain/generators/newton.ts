/**
 * Newton Fractal Generator
 * Run Newton's method on f(z) = z³ - 1, color by root convergence
 */

import Complex from 'complex.js';
import { FractalParams } from '../../shared/types';
import { IFractalGenerator, PatternData, validatePatternCoverage } from '../fractal-generator';

const MAX_ITERATION_ATTEMPTS = 3;
const CONVERGENCE_THRESHOLD = 0.001;

export class NewtonGenerator implements IFractalGenerator {
  private readonly roots: Complex[];

  constructor() {
    // Roots of z³ - 1 = 0
    this.roots = [
      new Complex(1, 0),
      new Complex(-0.5, Math.sqrt(3) / 2),
      new Complex(-0.5, -Math.sqrt(3) / 2)
    ];
  }

  generate(params: FractalParams): PatternData {
    let maxIterations = params.maxIterations || 64;
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

    const seedNorm = (seed % 1000) / 1000;
    const zoom = 1.5 + seedNorm * 0.5;
    const centerX = (seedNorm - 0.5) * 0.3;
    const centerY = (seedNorm - 0.5) * 0.3;

    for (let py = 0; py < height; py++) {
      const row: number[][] = [];
      for (let px = 0; px < width; px++) {
        const x = centerX + (px / width - 0.5) * zoom;
        const y = centerY + (py / height - 0.5) * zoom;
        
        const color = this.calculateColor(x, y, maxIterations);
        row.push([color[0], color[1], color[2]]);
      }
      pixels.push(row);
    }

    return { pixels, width, height };
  }

  private calculateColor(x: number, y: number, maxIterations: number): [number, number, number] {
    let z = new Complex(x, y);
    let iterations = 0;

    while (iterations < maxIterations) {
      // Newton iteration: z = z - f(z)/f'(z)
      // f(z) = z³ - 1, f'(z) = 3z²
      const zCubed = z.pow(3);
      const fz = zCubed.sub(1);
      const fpz = z.pow(2).mul(3);
      
      if (fpz.abs() < 1e-10) {
        break;
      }

      z = z.sub(fz.div(fpz));
      
      // Check convergence to roots
      const rootIndex = this.findConvergedRoot(z);
      if (rootIndex !== -1) {
        return this.rootToColor(rootIndex, iterations, maxIterations);
      }

      iterations++;
    }

    return [0, 0, 0];
  }

  private findConvergedRoot(z: Complex): number {
    for (let i = 0; i < this.roots.length; i++) {
      if (z.sub(this.roots[i]).abs() < CONVERGENCE_THRESHOLD) {
        return i;
      }
    }
    return -1;
  }

  private rootToColor(rootIndex: number, iterations: number, maxIterations: number): [number, number, number] {
    const baseColors: [number, number, number][] = [
      [255, 100, 100], // Red for root 1
      [100, 255, 100], // Green for root 2
      [100, 100, 255]  // Blue for root 3
    ];

    const base = baseColors[rootIndex];
    const brightness = 0.3 + (0.7 * (maxIterations - iterations)) / maxIterations;

    return [
      Math.round(base[0] * brightness),
      Math.round(base[1] * brightness),
      Math.round(base[2] * brightness)
    ];
  }

  validateCoverage(pattern: PatternData) {
    return validatePatternCoverage(pattern);
  }
}
