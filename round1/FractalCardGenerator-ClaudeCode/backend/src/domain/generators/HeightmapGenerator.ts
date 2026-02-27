/**
 * Heightmap Generator
 * Perlin/Simplex noise-based patterns
 */

import { FractalGenerator, FractalParams, Color, createColorArray, valueToColor, SeededRandom } from '../FractalGenerator';
import { FractalMethod } from '../../shared/types';

export class HeightmapGenerator implements FractalGenerator {
  private permutation: number[];

  constructor() {
    this.permutation = [];
  }

  getMethod(): FractalMethod {
    return 'heightmap';
  }

  generate(params: FractalParams): Color[][] {
    const { width, height, seed } = params;
    const random = new SeededRandom(seed);
    const colors = createColorArray(width, height);

    this.initializePermutation(random);

    const octaves = random.nextInt(3, 6);
    const frequency = random.nextFloat(0.01, 0.05);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const noiseValue = this.multiOctaveNoise(x * frequency, y * frequency, octaves);
        const normalized = (noiseValue + 1) / 2;

        colors[y][x] = valueToColor(normalized, seed);
      }
    }

    return colors;
  }

  private initializePermutation(random: SeededRandom): void {
    const p: number[] = [];
    for (let i = 0; i < 256; i++) {
      p[i] = i;
    }

    // Fisher-Yates shuffle
    for (let i = 255; i > 0; i--) {
      const j = random.nextInt(0, i);
      [p[i], p[j]] = [p[j], p[i]];
    }

    this.permutation = [...p, ...p];
  }

  private multiOctaveNoise(x: number, y: number, octaves: number): number {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.perlinNoise(x * frequency, y * frequency) * amplitude;

      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    return total / maxValue;
  }

  private perlinNoise(x: number, y: number): number {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;

    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);

    const u = this.fade(xf);
    const v = this.fade(yf);

    const aa = this.permutation[this.permutation[xi] + yi];
    const ab = this.permutation[this.permutation[xi] + yi + 1];
    const ba = this.permutation[this.permutation[xi + 1] + yi];
    const bb = this.permutation[this.permutation[xi + 1] + yi + 1];

    const x1 = this.lerp(this.gradient(aa, xf, yf), this.gradient(ba, xf - 1, yf), u);
    const x2 = this.lerp(this.gradient(ab, xf, yf - 1), this.gradient(bb, xf - 1, yf - 1), u);

    return this.lerp(x1, x2, v);
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }

  private gradient(hash: number, x: number, y: number): number {
    const h = hash & 3;

    if (h === 0) return x + y;
    if (h === 1) return -x + y;
    if (h === 2) return x - y;
    return -x - y;
  }
}
