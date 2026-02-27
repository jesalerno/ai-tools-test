/**
 * IFS (Iterated Function System) Fractal Generator
 * Barnsley Fern or Sierpiński Triangle via affine transformations
 */

import { FractalParams } from '../../shared/types';
import { IFractalGenerator, PatternData, validatePatternCoverage } from '../fractal-generator';

const MAX_ITERATION_ATTEMPTS = 3;

interface AffineTransform {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
  probability: number;
}

export class IFSGenerator implements IFractalGenerator {
  generate(params: FractalParams): PatternData {
    let iterations = Math.floor((params.maxIterations || 100000) * (params.width * params.height) / 10000);
    let pattern: PatternData;
    let attempts = 0;

    do {
      pattern = this.generatePattern(params, iterations);
      const validation = this.validateCoverage(pattern);
      
      if (validation.isValid) {
        break;
      }

      iterations = Math.floor(iterations * 1.5);
      attempts++;
    } while (attempts < MAX_ITERATION_ATTEMPTS);

    return pattern;
  }

  private generatePattern(params: FractalParams, iterations: number): PatternData {
    const { width, height, seed } = params;
    
    // Use seed to choose IFS type
    const ifsType = seed % 2 === 0 ? 'fern' : 'sierpinski';
    const transforms = this.getTransforms(ifsType);

    // Create density map
    const density: number[][] = Array(height).fill(0).map(() => Array(width).fill(0));

    let x = 0;
    let y = 0;

    // Generate points
    for (let i = 0; i < iterations; i++) {
      const transform = this.selectTransform(transforms);
      const newX = transform.a * x + transform.b * y + transform.e;
      const newY = transform.c * x + transform.d * y + transform.f;
      x = newX;
      y = newY;

      // Map to pixel coordinates
      const px = this.mapToPixel(x, width, ifsType === 'fern' ? -2.5 : 0, ifsType === 'fern' ? 2.5 : 1);
      const py = this.mapToPixel(y, height, ifsType === 'fern' ? 0 : 0, ifsType === 'fern' ? 10 : 1);

      if (px >= 0 && px < width && py >= 0 && py < height) {
        density[py][px]++;
      }
    }

    // Convert density to colors
    return this.densityToPattern(density, width, height);
  }

  private getTransforms(type: 'fern' | 'sierpinski'): AffineTransform[] {
    if (type === 'fern') {
      return [
        { a: 0, b: 0, c: 0, d: 0.16, e: 0, f: 0, probability: 0.01 },
        { a: 0.85, b: 0.04, c: -0.04, d: 0.85, e: 0, f: 1.6, probability: 0.85 },
        { a: 0.2, b: -0.26, c: 0.23, d: 0.22, e: 0, f: 1.6, probability: 0.07 },
        { a: -0.15, b: 0.28, c: 0.26, d: 0.24, e: 0, f: 0.44, probability: 0.07 }
      ];
    } else {
      return [
        { a: 0.5, b: 0, c: 0, d: 0.5, e: 0, f: 0, probability: 0.33 },
        { a: 0.5, b: 0, c: 0, d: 0.5, e: 0.5, f: 0, probability: 0.33 },
        { a: 0.5, b: 0, c: 0, d: 0.5, e: 0.25, f: 0.5, probability: 0.34 }
      ];
    }
  }

  private selectTransform(transforms: AffineTransform[]): AffineTransform {
    const rand = Math.random();
    let cumulative = 0;

    for (const transform of transforms) {
      cumulative += transform.probability;
      if (rand < cumulative) {
        return transform;
      }
    }

    return transforms[transforms.length - 1];
  }

  private mapToPixel(value: number, size: number, min: number, max: number): number {
    return Math.floor(((value - min) / (max - min)) * size);
  }

  private densityToPattern(density: number[][], width: number, height: number): PatternData {
    const maxDensity = Math.max(...density.flat());
    const pixels: number[][][] = [];

    for (let y = 0; y < height; y++) {
      const row: number[][] = [];
      for (let x = 0; x < width; x++) {
        const value = density[y][x];
        const normalized = value / maxDensity;
        const intensity = Math.round(normalized * 255);
        row.push([intensity, intensity * 0.8, intensity * 0.6]);
      }
      pixels.push(row);
    }

    return { pixels, width, height };
  }

  validateCoverage(pattern: PatternData) {
    return validatePatternCoverage(pattern);
  }
}
