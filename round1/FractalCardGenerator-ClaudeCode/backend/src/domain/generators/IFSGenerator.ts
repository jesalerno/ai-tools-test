/**
 * Iterated Function System (IFS) Generator
 * Generates Barnsley Fern or Sierpiński Triangle
 */

import { FractalGenerator, FractalParams, Color, createColorArray, SeededRandom } from '../FractalGenerator';
import { FractalMethod } from '../../shared/types';

const ITERATIONS = 100000;

interface Transform {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
  probability: number;
}

export class IFSGenerator implements FractalGenerator {
  getMethod(): FractalMethod {
    return 'ifs';
  }

  generate(params: FractalParams): Color[][] {
    const { width, height, seed } = params;
    const random = new SeededRandom(seed);
    const colors = createColorArray(width, height);

    // Choose between Barnsley Fern and Sierpiński
    const useFern = random.nextInt(0, 1) === 0;
    const transforms = useFern ? this.getBarnsleyFernTransforms() : this.getSierpinskiTransforms();

    const points = this.generatePoints(transforms, random);
    this.plotPoints(points, colors, width, height, seed);

    return colors;
  }

  private getBarnsleyFernTransforms(): Transform[] {
    return [
      { a: 0, b: 0, c: 0, d: 0.16, e: 0, f: 0, probability: 0.01 },
      { a: 0.85, b: 0.04, c: -0.04, d: 0.85, e: 0, f: 1.6, probability: 0.85 },
      { a: 0.2, b: -0.26, c: 0.23, d: 0.22, e: 0, f: 1.6, probability: 0.07 },
      { a: -0.15, b: 0.28, c: 0.26, d: 0.24, e: 0, f: 0.44, probability: 0.07 }
    ];
  }

  private getSierpinskiTransforms(): Transform[] {
    return [
      { a: 0.5, b: 0, c: 0, d: 0.5, e: 0, f: 0, probability: 0.33 },
      { a: 0.5, b: 0, c: 0, d: 0.5, e: 0.5, f: 0, probability: 0.33 },
      { a: 0.5, b: 0, c: 0, d: 0.5, e: 0.25, f: 0.5, probability: 0.34 }
    ];
  }

  private generatePoints(transforms: Transform[], random: SeededRandom): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];
    let x = 0;
    let y = 0;

    for (let i = 0; i < ITERATIONS; i++) {
      const transform = this.selectTransform(transforms, random);
      const newX = transform.a * x + transform.b * y + transform.e;
      const newY = transform.c * x + transform.d * y + transform.f;

      x = newX;
      y = newY;

      points.push({ x, y });
    }

    return points;
  }

  private selectTransform(transforms: Transform[], random: SeededRandom): Transform {
    const r = random.next();
    let cumulative = 0;

    for (const transform of transforms) {
      cumulative += transform.probability;
      if (r <= cumulative) {
        return transform;
      }
    }

    return transforms[transforms.length - 1];
  }

  private plotPoints(points: { x: number; y: number }[], colors: Color[][], width: number, height: number, seed: number): void {
    const densityMap = this.createDensityMap(points, width, height);
    const maxDensity = this.findMaxDensity(densityMap);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const density = densityMap[y][x];
        const normalized = maxDensity > 0 ? density / maxDensity : 0;

        if (normalized > 0) {
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
    const normalized = (x - bounds.minX) / range;
    return Math.floor(normalized * width * (1 - 2 * padding) + width * padding);
  }

  private mapToPixelY(y: number, height: number, bounds: { minX: number; maxX: number; minY: number; maxY: number }): number {
    const padding = 0.1;
    const range = bounds.maxY - bounds.minY;
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
    const saturation = 0.7;
    const value = Math.pow(density, 0.5);

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
