/**
 * Strange Attractor Generator
 * Lorenz, Clifford, or de Jong attractors
 */

import { FractalGenerator, FractalParams, Color, createColorArray, SeededRandom } from '../FractalGenerator';
import { FractalMethod } from '../../shared/types';

const ITERATIONS = 50000;
const WARMUP_ITERATIONS = 1000;

export class StrangeAttractorGenerator implements FractalGenerator {
  getMethod(): FractalMethod {
    return 'strange-attractor';
  }

  generate(params: FractalParams): Color[][] {
    const { width, height, seed } = params;
    const random = new SeededRandom(seed);
    const colors = createColorArray(width, height);

    const attractorType = random.nextInt(0, 2);

    let points: { x: number; y: number }[];
    if (attractorType === 0) {
      points = this.generateLorenz(random);
    } else if (attractorType === 1) {
      points = this.generateClifford(random);
    } else {
      points = this.generateDeJong(random);
    }

    this.plotPoints(points, colors, width, height, seed);

    return colors;
  }

  private generateLorenz(random: SeededRandom): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];
    const dt = 0.01;

    let x = random.nextFloat(-1, 1);
    let y = random.nextFloat(-1, 1);
    let z = random.nextFloat(-1, 1);

    const sigma = 10;
    const rho = 28;
    const beta = 8 / 3;

    for (let i = 0; i < ITERATIONS + WARMUP_ITERATIONS; i++) {
      const dx = sigma * (y - x);
      const dy = x * (rho - z) - y;
      const dz = x * y - beta * z;

      x += dx * dt;
      y += dy * dt;
      z += dz * dt;

      if (i >= WARMUP_ITERATIONS) {
        points.push({ x, y });
      }
    }

    return points;
  }

  private generateClifford(random: SeededRandom): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];

    const a = random.nextFloat(-2, 2);
    const b = random.nextFloat(-2, 2);
    const c = random.nextFloat(-2, 2);
    const d = random.nextFloat(-2, 2);

    let x = 0;
    let y = 0;

    for (let i = 0; i < ITERATIONS; i++) {
      const newX = Math.sin(a * y) + c * Math.cos(a * x);
      const newY = Math.sin(b * x) + d * Math.cos(b * y);

      x = newX;
      y = newY;

      points.push({ x, y });
    }

    return points;
  }

  private generateDeJong(random: SeededRandom): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];

    const a = random.nextFloat(-3, 3);
    const b = random.nextFloat(-3, 3);
    const c = random.nextFloat(-3, 3);
    const d = random.nextFloat(-3, 3);

    let x = 0;
    let y = 0;

    for (let i = 0; i < ITERATIONS; i++) {
      const newX = Math.sin(a * y) - Math.cos(b * x);
      const newY = Math.sin(c * x) - Math.cos(d * y);

      x = newX;
      y = newY;

      points.push({ x, y });
    }

    return points;
  }

  private plotPoints(points: { x: number; y: number }[], colors: Color[][], width: number, height: number, seed: number): void {
    const densityMap = this.createDensityMap(points, width, height);
    const maxDensity = this.findMaxDensity(densityMap);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const density = densityMap[y][x];
        if (density > 0) {
          const normalized = maxDensity > 0 ? density / maxDensity : 0;
          colors[y][x] = this.densityToColor(normalized, seed);
        }
      }
    }
  }

  private createDensityMap(points: { x: number; y: number }[], width: number, height: number): number[][] {
    const densityMap: number[][] = Array(height).fill(0).map(() => Array(width).fill(0));

    const bounds = this.calculateBounds(points);

    for (const point of points) {
      const px = this.mapToPixelX(point.x, width, bounds);
      const py = this.mapToPixelY(point.y, height, bounds);

      if (px >= 0 && px < width && py >= 0 && py < height) {
        densityMap[py][px]++;
      }
    }

    return densityMap;
  }

  private calculateBounds(points: { x: number; y: number }[]): { minX: number; maxX: number; minY: number; maxY: number } {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    for (const point of points) {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }

    return { minX, maxX, minY, maxY };
  }

  private mapToPixelX(x: number, width: number, bounds: { minX: number; maxX: number; minY: number; maxY: number }): number {
    const padding = 0.1;
    const range = bounds.maxX - bounds.minX;
    if (range === 0) return Math.floor(width / 2);
    const normalized = (x - bounds.minX) / range;
    return Math.floor(normalized * width * (1 - 2 * padding) + width * padding);
  }

  private mapToPixelY(y: number, height: number, bounds: { minX: number; maxX: number; minY: number; maxY: number }): number {
    const padding = 0.1;
    const range = bounds.maxY - bounds.minY;
    if (range === 0) return Math.floor(height / 2);
    const normalized = (y - bounds.minY) / range;
    return Math.floor((1 - normalized) * height * (1 - 2 * padding) + height * padding);
  }

  private findMaxDensity(densityMap: number[][]): number {
    let max = 0;
    for (const row of densityMap) {
      for (const value of row) {
        max = Math.max(max, value);
      }
    }
    return max;
  }

  private densityToColor(density: number, seed: number): Color {
    const hue = (seed * 137.5) % 360;
    const saturation = 0.8;
    const value = Math.pow(density, 0.3);

    return this.hsvToRgb(hue, saturation, value);
  }

  private hsvToRgb(h: number, s: number, v: number): Color {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r = 0, g = 0, b = 0;

    if (h < 60) {
      r = c; g = x; b = 0;
    } else if (h < 120) {
      r = x; g = c; b = 0;
    } else if (h < 180) {
      r = 0; g = c; b = x;
    } else if (h < 240) {
      r = 0; g = x; b = c;
    } else if (h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }

    return {
      r: Math.floor((r + m) * 255),
      g: Math.floor((g + m) * 255),
      b: Math.floor((b + m) * 255)
    };
  }
}
