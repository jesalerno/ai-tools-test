/**
 * Flame Fractal Generator
 * Probabilistic IFS with non-linear variations
 */

import { FractalParams } from '../../shared/types';
import { IFractalGenerator, PatternData, validatePatternCoverage } from '../fractal-generator';

const MAX_ITERATION_ATTEMPTS = 3;

interface FlameVariation {
  weight: number;
  type: string;
}

export class FlameGenerator implements IFractalGenerator {
  generate(params: FractalParams): PatternData {
    let iterations = Math.floor((params.maxIterations || 500000) * (params.width * params.height) / 10000);
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
    const density: number[][] = Array(height).fill(0).map(() => Array(width).fill(0));

    const variations = this.getVariations(seed);
    let x = 0;
    let y = 0;

    for (let i = 0; i < iterations; i++) {
      const variation = variations[i % variations.length];
      const [newX, newY] = this.applyVariation(x, y, variation.type);
      x = newX * variation.weight;
      y = newY * variation.weight;

      const px = Math.floor(((x + 3) / 6) * width);
      const py = Math.floor(((y + 3) / 6) * height);

      if (px >= 0 && px < width && py >= 0 && py < height) {
        density[py][px]++;
      }
    }

    return this.densityToPattern(density, width, height);
  }

  private getVariations(seed: number): FlameVariation[] {
    const seedNorm = (seed % 1000) / 1000;
    
    return [
      { weight: 0.8 + seedNorm * 0.4, type: 'linear' },
      { weight: 0.6 + seedNorm * 0.3, type: 'sinusoidal' },
      { weight: 0.5 + seedNorm * 0.5, type: 'spherical' },
      { weight: 0.7 + seedNorm * 0.3, type: 'swirl' }
    ];
  }

  private applyVariation(x: number, y: number, type: string): [number, number] {
    const r = Math.sqrt(x * x + y * y);

    switch (type) {
      case 'linear':
        return [x, y];
      
      case 'sinusoidal':
        return [Math.sin(x), Math.sin(y)];
      
      case 'spherical':
        if (r < 0.0001) return [0, 0];
        return [x / (r * r), y / (r * r)];
      
      case 'swirl':
        if (r < 0.0001) return [0, 0];
        const sinr = Math.sin(r * r);
        const cosr = Math.cos(r * r);
        return [x * sinr - y * cosr, x * cosr + y * sinr];
      
      case 'horseshoe':
        if (r < 0.0001) return [0, 0];
        return [(x - y) * (x + y) / r, 2 * x * y / r];
      
      default:
        return [x, y];
    }
  }

  private densityToPattern(density: number[][], width: number, height: number): PatternData {
    const maxDensity = Math.max(...density.flat());
    const pixels: number[][][] = [];

    for (let y = 0; y < height; y++) {
      const row: number[][] = [];
      for (let x = 0; x < width; x++) {
        const value = density[y][x];
        const normalized = Math.pow(value / maxDensity, 0.4);
        
        const hue = (normalized * 360) % 360;
        const rgb = this.hslToRgb(hue, 0.9, normalized * 0.5);
        row.push([rgb[0], rgb[1], rgb[2]]);
      }
      pixels.push(row);
    }

    return { pixels, width, height };
  }

  private hslToRgb(h: number, s: number, l: number): [number, number, number] {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;
    const hueSegment = Math.floor(h / 60);

    if (hueSegment === 0) { r = c; g = x; }
    else if (hueSegment === 1) { r = x; g = c; }
    else if (hueSegment === 2) { g = c; b = x; }
    else if (hueSegment === 3) { g = x; b = c; }
    else if (hueSegment === 4) { r = x; b = c; }
    else { r = c; b = x; }

    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    ];
  }

  validateCoverage(pattern: PatternData) {
    return validatePatternCoverage(pattern);
  }
}
