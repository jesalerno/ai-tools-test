/**
 * Heightmap Fractal Generator
 * Perlin/Simplex noise-based heightmaps
 */

import { FractalParams } from '../../shared/types';
import { IFractalGenerator, PatternData, validatePatternCoverage } from '../fractal-generator';

export class HeightmapGenerator implements IFractalGenerator {
  private permutation: number[];

  constructor() {
    this.permutation = [];
  }

  generate(params: FractalParams): PatternData {
    this.initPermutation(params.seed);
    return this.generatePattern(params);
  }

  private initPermutation(seed: number): void {
    const p: number[] = [];
    for (let i = 0; i < 256; i++) {
      p[i] = i;
    }

    // Shuffle using seed
    let random = seed;
    for (let i = 255; i > 0; i--) {
      random = (random * 1103515245 + 12345) & 0x7fffffff;
      const j = Math.floor((random / 0x7fffffff) * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }

    this.permutation = [...p, ...p];
  }

  private generatePattern(params: FractalParams): PatternData {
    const { width, height, seed } = params;
    const pixels: number[][][] = [];

    const seedNorm = (seed % 1000) / 1000;
    const scale = 0.02 + seedNorm * 0.03;
    const octaves = 4;

    for (let y = 0; y < height; y++) {
      const row: number[][] = [];
      for (let x = 0; x < width; x++) {
        let value = 0;
        let amplitude = 1;
        let frequency = scale;
        let maxValue = 0;

        for (let o = 0; o < octaves; o++) {
          value += this.noise(x * frequency, y * frequency) * amplitude;
          maxValue += amplitude;
          amplitude *= 0.5;
          frequency *= 2;
        }

        value /= maxValue;
        const normalized = (value + 1) / 2;
        const color = this.heightToColor(normalized);
        row.push([color[0], color[1], color[2]]);
      }
      pixels.push(row);
    }

    return { pixels, width, height };
  }

  private noise(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);

    const u = this.fade(x);
    const v = this.fade(y);

    const a = this.permutation[X] + Y;
    const b = this.permutation[X + 1] + Y;

    return this.lerp(v,
      this.lerp(u, this.grad(this.permutation[a], x, y), this.grad(this.permutation[b], x - 1, y)),
      this.lerp(u, this.grad(this.permutation[a + 1], x, y - 1), this.grad(this.permutation[b + 1], x - 1, y - 1))
    );
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number): number {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  private heightToColor(height: number): [number, number, number] {
    if (height < 0.3) {
      // Deep blue
      return [0, Math.floor(height * 255), 128];
    } else if (height < 0.5) {
      // Green
      return [Math.floor((height - 0.3) * 1275), 200, 50];
    } else if (height < 0.7) {
      // Yellow/Brown
      return [200, Math.floor(200 - (height - 0.5) * 500), 50];
    } else {
      // White (snow)
      const val = Math.floor(150 + (height - 0.7) * 350);
      return [val, val, val];
    }
  }

  validateCoverage(pattern: PatternData) {
    return validatePatternCoverage(pattern);
  }
}
