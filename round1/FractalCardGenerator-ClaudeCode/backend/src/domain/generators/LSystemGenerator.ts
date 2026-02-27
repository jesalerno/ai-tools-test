/**
 * L-System Fractal Generator
 * Dragon curve or Koch curve using turtle graphics
 */

import { FractalGenerator, FractalParams, Color, createColorArray, SeededRandom } from '../FractalGenerator';
import { FractalMethod } from '../../shared/types';

interface TurtleState {
  x: number;
  y: number;
  angle: number;
}

interface LSystemRule {
  axiom: string;
  rules: Map<string, string>;
  angle: number;
  iterations: number;
}

export class LSystemGenerator implements FractalGenerator {
  getMethod(): FractalMethod {
    return 'l-system';
  }

  generate(params: FractalParams): Color[][] {
    const { width, height, seed } = params;
    const random = new SeededRandom(seed);
    const colors = createColorArray(width, height);

    const systems = [this.getDragonCurve(), this.getKochCurve()];
    const system = systems[random.nextInt(0, systems.length - 1)];

    const instructions = this.expandLSystem(system);
    const path = this.executeTurtle(instructions, system.angle);

    this.drawPath(path, colors, width, height, seed);

    return colors;
  }

  private getDragonCurve(): LSystemRule {
    const rules = new Map<string, string>();
    rules.set('F', 'F+G');
    rules.set('G', 'F-G');

    return {
      axiom: 'F',
      rules,
      angle: 90,
      iterations: 12
    };
  }

  private getKochCurve(): LSystemRule {
    const rules = new Map<string, string>();
    rules.set('F', 'F+F--F+F');

    return {
      axiom: 'F',
      rules,
      angle: 60,
      iterations: 4
    };
  }

  private expandLSystem(system: LSystemRule): string {
    let current = system.axiom;

    for (let i = 0; i < system.iterations; i++) {
      current = this.applyRules(current, system.rules);
    }

    return current;
  }

  private applyRules(input: string, rules: Map<string, string>): string {
    let output = '';

    for (const char of input) {
      output += rules.get(char) || char;
    }

    return output;
  }

  private executeTurtle(instructions: string, turnAngle: number): { x: number; y: number }[] {
    const path: { x: number; y: number }[] = [];
    const state: TurtleState = { x: 0, y: 0, angle: 0 };
    const stack: TurtleState[] = [];

    const stepSize = 1;

    for (const char of instructions) {
      if (char === 'F' || char === 'G') {
        path.push({ x: state.x, y: state.y });

        state.x += stepSize * Math.cos(state.angle * Math.PI / 180);
        state.y += stepSize * Math.sin(state.angle * Math.PI / 180);

        path.push({ x: state.x, y: state.y });
      } else if (char === '+') {
        state.angle += turnAngle;
      } else if (char === '-') {
        state.angle -= turnAngle;
      } else if (char === '[') {
        stack.push({ ...state });
      } else if (char === ']') {
        const saved = stack.pop();
        if (saved) {
          state.x = saved.x;
          state.y = saved.y;
          state.angle = saved.angle;
        }
      }
    }

    return path;
  }

  private drawPath(path: { x: number; y: number }[], colors: Color[][], width: number, height: number, seed: number): void {
    if (path.length === 0) return;

    const bounds = this.calculateBounds(path);
    const densityMap: number[][] = Array(height).fill(0).map(() => Array(width).fill(0));

    for (let i = 0; i < path.length - 1; i++) {
      this.drawLine(path[i], path[i + 1], densityMap, width, height, bounds);
    }

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

  private calculateBounds(path: { x: number; y: number }[]): { minX: number; maxX: number; minY: number; maxY: number } {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    for (const point of path) {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }

    return { minX, maxX, minY, maxY };
  }

  private drawLine(p1: { x: number; y: number }, p2: { x: number; y: number }, densityMap: number[][], width: number, height: number, bounds: { minX: number; maxX: number; minY: number; maxY: number }): void {
    const x1 = this.mapToPixelX(p1.x, width, bounds);
    const y1 = this.mapToPixelY(p1.y, height, bounds);
    const x2 = this.mapToPixelX(p2.x, width, bounds);
    const y2 = this.mapToPixelY(p2.y, height, bounds);

    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;

    let x = x1;
    let y = y1;

    while (true) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        densityMap[y][x]++;
      }

      if (x === x2 && y === y2) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
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
    const value = 0.3 + density * 0.7;

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
