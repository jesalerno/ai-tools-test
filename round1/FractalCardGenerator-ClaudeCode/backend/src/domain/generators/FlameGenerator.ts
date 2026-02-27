/**
 * Flame Fractal Generator
 * Probabilistic IFS with non-linear variations
 */

import { FractalGenerator, FractalParams, Color, createColorArray, SeededRandom } from '../FractalGenerator';
import { FractalMethod } from '../../shared/types';

const ITERATIONS = 100000;
const WARMUP_ITERATIONS = 100;

interface FlameTransform {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
  color: number;
  variations: number[];
  weight: number;
}

export class FlameGenerator implements FractalGenerator {
  getMethod(): FractalMethod {
    return 'flame';
  }

  generate(params: FractalParams): Color[][] {
    const { width, height, seed } = params;
    const random = new SeededRandom(seed);
    const colors = createColorArray(width, height);

    const transforms = this.createTransforms(random);
    const points = this.generatePoints(transforms, random);

    this.plotPoints(points, colors, width, height, seed);

    return colors;
  }

  private createTransforms(random: SeededRandom): FlameTransform[] {
    const numTransforms = random.nextInt(2, 4);
    const transforms: FlameTransform[] = [];

    for (let i = 0; i < numTransforms; i++) {
      transforms.push({
        a: random.nextFloat(-1, 1),
        b: random.nextFloat(-1, 1),
        c: random.nextFloat(-1, 1),
        d: random.nextFloat(-1, 1),
        e: random.nextFloat(-2, 2),
        f: random.nextFloat(-2, 2),
        color: random.next(),
        variations: this.selectVariations(random),
        weight: 1.0
      });
    }

    return transforms;
  }

  private selectVariations(random: SeededRandom): number[] {
    const numVariations = random.nextInt(1, 3);
    const variations: number[] = [];

    for (let i = 0; i < numVariations; i++) {
      variations.push(random.nextInt(0, 5));
    }

    return variations;
  }

  private generatePoints(transforms: FlameTransform[], random: SeededRandom): Array<{ x: number; y: number; color: number }> {
    const points: Array<{ x: number; y: number; color: number }> = [];

    let x = random.nextFloat(-1, 1);
    let y = random.nextFloat(-1, 1);
    let color = 0;

    for (let i = 0; i < ITERATIONS + WARMUP_ITERATIONS; i++) {
      const transform = this.selectTransform(transforms, random);

      const result = this.applyTransform(x, y, transform, random);
      x = result.x;
      y = result.y;
      color = (color + transform.color) / 2;

      if (i >= WARMUP_ITERATIONS) {
        points.push({ x, y, color });
      }
    }

    return points;
  }

  private selectTransform(transforms: FlameTransform[], random: SeededRandom): FlameTransform {
    const totalWeight = transforms.reduce((sum, t) => sum + t.weight, 0);
    let r = random.next() * totalWeight;

    for (const transform of transforms) {
      r -= transform.weight;
      if (r <= 0) {
        return transform;
      }
    }

    return transforms[transforms.length - 1];
  }

  private applyTransform(x: number, y: number, transform: FlameTransform, _random: SeededRandom): { x: number; y: number } {
    const tx = transform.a * x + transform.b * y + transform.e;
    const ty = transform.c * x + transform.d * y + transform.f;

    let vx = 0;
    let vy = 0;

    for (const variation of transform.variations) {
      const v = this.applyVariation(tx, ty, variation);
      vx += v.x;
      vy += v.y;
    }

    const n = transform.variations.length;
    return {
      x: n > 0 ? vx / n : tx,
      y: n > 0 ? vy / n : ty
    };
  }

  private applyVariation(x: number, y: number, variation: number): { x: number; y: number } {
    const r = Math.sqrt(x * x + y * y);
    const theta = Math.atan2(y, x);

    switch (variation) {
      case 0: // Linear
        return { x, y };

      case 1: // Sinusoidal
        return { x: Math.sin(x), y: Math.sin(y) };

      case 2: // Spherical
        return r > 0 ? { x: x / (r * r), y: y / (r * r) } : { x: 0, y: 0 };

      case 3: // Swirl
        return {
          x: x * Math.sin(r * r) - y * Math.cos(r * r),
          y: x * Math.cos(r * r) + y * Math.sin(r * r)
        };

      case 4: // Horseshoe
        return r > 0 ? {
          x: (x - y) * (x + y) / r,
          y: 2 * x * y / r
        } : { x: 0, y: 0 };

      case 5: // Polar
        return { x: theta / Math.PI, y: r - 1 };

      default:
        return { x, y };
    }
  }

  private plotPoints(points: Array<{ x: number; y: number; color: number }>, colors: Color[][], width: number, height: number, seed: number): void {
    const densityMap: number[][] = Array(height).fill(0).map(() => Array(width).fill(0));
    const colorMap: number[][] = Array(height).fill(0).map(() => Array(width).fill(0));

    const bounds = this.calculateBounds(points);

    for (const point of points) {
      const px = this.mapToPixelX(point.x, width, bounds);
      const py = this.mapToPixelY(point.y, height, bounds);

      if (px >= 0 && px < width && py >= 0 && py < height) {
        densityMap[py][px]++;
        colorMap[py][px] = (colorMap[py][px] + point.color) / 2;
      }
    }

    const maxDensity = this.findMaxDensity(densityMap);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const density = densityMap[y][x];
        if (density > 0) {
          const normalized = maxDensity > 0 ? density / maxDensity : 0;
          const colorValue = colorMap[y][x];
          colors[y][x] = this.flameColor(normalized, colorValue, seed);
        }
      }
    }
  }

  private calculateBounds(points: Array<{ x: number; y: number; color: number }>): { minX: number; maxX: number; minY: number; maxY: number } {
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

  private flameColor(density: number, colorValue: number, seed: number): Color {
    const hue = ((colorValue + seed * 0.1) * 360) % 360;
    const saturation = 0.8;
    const value = Math.pow(density, 0.4);

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
