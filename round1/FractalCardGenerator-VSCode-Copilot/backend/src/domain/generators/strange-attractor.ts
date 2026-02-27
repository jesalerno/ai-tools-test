/**
 * Strange Attractor Fractal Generator
 * Lorenz, Clifford, or de Jong attractors with alpha blending
 */

import { FractalParams } from '../../shared/types';
import { IFractalGenerator, PatternData, validatePatternCoverage } from '../fractal-generator';

const MAX_ITERATION_ATTEMPTS = 3;

export class StrangeAttractorGenerator implements IFractalGenerator {
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

    // Select attractor type based on seed
    const attractorTypes = ['clifford', 'dejong', 'lorenz'];
    const type = attractorTypes[seed % attractorTypes.length];

    const density: number[][] = Array(height).fill(0).map(() => Array(width).fill(0));

    if (type === 'lorenz') {
      this.generateLorenz(density, width, height, seed, iterations);
    } else if (type === 'clifford') {
      this.generateClifford(density, width, height, seed, iterations);
    } else {
      this.generateDeJong(density, width, height, seed, iterations);
    }

    return this.densityToPattern(density, width, height);
  }

  private generateClifford(density: number[][], width: number, height: number, seed: number, iterations: number): void {
    const seedNorm = (seed % 1000) / 1000;
    const a = -1.4 + seedNorm * 0.8;
    const b = 1.6 + seedNorm * 0.4;
    const c = 1.0 + seedNorm * 0.4;
    const d = 0.7 + seedNorm * 0.3;

    let x = 0;
    let y = 0;

    for (let i = 0; i < iterations; i++) {
      const newX = Math.sin(a * y) + c * Math.cos(a * x);
      const newY = Math.sin(b * x) + d * Math.cos(b * y);
      x = newX;
      y = newY;

      const px = Math.floor(((x + 3) / 6) * width);
      const py = Math.floor(((y + 3) / 6) * height);

      if (px >= 0 && px < width && py >= 0 && py < height) {
        density[py][px]++;
      }
    }
  }

  private generateDeJong(density: number[][], width: number, height: number, seed: number, iterations: number): void {
    const seedNorm = (seed % 1000) / 1000;
    const a = -2.0 + seedNorm * 4.0;
    const b = -2.0 + seedNorm * 4.0;
    const c = -2.0 + seedNorm * 4.0;
    const d = -2.0 + seedNorm * 4.0;

    let x = 0;
    let y = 0;

    for (let i = 0; i < iterations; i++) {
      const newX = Math.sin(a * y) - Math.cos(b * x);
      const newY = Math.sin(c * x) - Math.cos(d * y);
      x = newX;
      y = newY;

      const px = Math.floor(((x + 3) / 6) * width);
      const py = Math.floor(((y + 3) / 6) * height);

      if (px >= 0 && px < width && py >= 0 && py < height) {
        density[py][px]++;
      }
    }
  }

  private generateLorenz(density: number[][], width: number, height: number, seed: number, iterations: number): void {
    const dt = 0.01;
    const sigma = 10;
    const rho = 28;
    const beta = 8/3;

    const seedNorm = (seed % 1000) / 1000;
    let x = seedNorm * 10 - 5;
    let y = seedNorm * 10 - 5;
    let z = seedNorm * 20 + 10;

    for (let i = 0; i < iterations; i++) {
      const dx = sigma * (y - x);
      const dy = x * (rho - z) - y;
      const dz = x * y - beta * z;

      x += dx * dt;
      y += dy * dt;
      z += dz * dt;

      const px = Math.floor(((x + 30) / 60) * width);
      const py = Math.floor(((z) / 50) * height);

      if (px >= 0 && px < width && py >= 0 && py < height) {
        density[py][px]++;
      }
    }
  }

  private densityToPattern(density: number[][], width: number, height: number): PatternData {
    const maxDensity = Math.max(...density.flat());
    const pixels: number[][][] = [];

    for (let y = 0; y < height; y++) {
      const row: number[][] = [];
      for (let x = 0; x < width; x++) {
        const value = density[y][x];
        const normalized = Math.pow(value / maxDensity, 0.5);
        const hue = normalized * 240;
        const rgb = this.hslToRgb(hue, 0.8, 0.5);
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
