/**
 * L-System Fractal Generator
 * String rewriting with turtle graphics (Dragon curve or Koch curve)
 */

import { FractalParams } from '../../shared/types';
import { IFractalGenerator, PatternData, validatePatternCoverage } from '../fractal-generator';

const MAX_ITERATION_ATTEMPTS = 3;

interface LSystemRule {
  axiom: string;
  rules: Record<string, string>;
  angle: number;
  iterations: number;
}

export class LSystemGenerator implements IFractalGenerator {
  generate(params: FractalParams): PatternData {
    let iterations = 10;
    let pattern: PatternData;
    let attempts = 0;

    do {
      pattern = this.generatePattern(params, iterations);
      const validation = this.validateCoverage(pattern);
      
      if (validation.isValid) {
        break;
      }

      iterations = Math.min(iterations + 2, 15);
      attempts++;
    } while (attempts < MAX_ITERATION_ATTEMPTS);

    return pattern;
  }

  private generatePattern(params: FractalParams, iterations: number): PatternData {
    const { width, height, seed } = params;

    // Select L-System type based on seed
    const systems = this.getLSystems();
    const systemType = seed % systems.length;
    const system = systems[systemType];

    // Generate L-System string
    const lstring = this.generateLString(system, Math.min(iterations, system.iterations));

    // Render with turtle graphics
    return this.renderTurtle(lstring, system.angle, width, height);
  }

  private getLSystems(): LSystemRule[] {
    return [
      {
        axiom: 'F',
        rules: { 'F': 'F+F-F-F+F' },
        angle: 90,
        iterations: 4
      },
      {
        axiom: 'FX',
        rules: { 'X': 'X+YF+', 'Y': '-FX-Y' },
        angle: 90,
        iterations: 12
      },
      {
        axiom: 'F',
        rules: { 'F': 'F-F++F-F' },
        angle: 60,
        iterations: 5
      }
    ];
  }

  private generateLString(system: LSystemRule, iterations: number): string {
    let current = system.axiom;

    for (let i = 0; i < iterations; i++) {
      let next = '';
      for (const char of current) {
        next += system.rules[char] || char;
      }
      current = next;
    }

    return current;
  }

  private renderTurtle(lstring: string, angleStep: number, width: number, height: number): PatternData {
    const pixels: number[][][] = Array(height).fill(0).map(() => 
      Array(width).fill(0).map(() => [0, 0, 0])
    );

    let x = width / 2;
    let y = height / 2;
    let angle = 0;
    const stepSize = Math.min(width, height) / (Math.pow(2, 6));

    const stack: Array<{x: number, y: number, angle: number}> = [];

    for (const char of lstring) {
      if (char === 'F') {
        const newX = x + stepSize * Math.cos(angle * Math.PI / 180);
        const newY = y + stepSize * Math.sin(angle * Math.PI / 180);
        this.drawLine(pixels, x, y, newX, newY, width, height);
        x = newX;
        y = newY;
      } else if (char === '+') {
        angle += angleStep;
      } else if (char === '-') {
        angle -= angleStep;
      } else if (char === '[') {
        stack.push({x, y, angle});
      } else if (char === ']') {
        const state = stack.pop();
        if (state) {
          x = state.x;
          y = state.y;
          angle = state.angle;
        }
      }
    }

    return { pixels, width, height };
  }

  private drawLine(pixels: number[][][], x1: number, y1: number, x2: number, y2: number, width: number, height: number): void {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = Math.floor(x1 + dx * t);
      const y = Math.floor(y1 + dy * t);

      if (x >= 0 && x < width && y >= 0 && y < height) {
        pixels[y][x] = [100 + Math.floor(155 * t), 200, 255];
      }
    }
  }

  validateCoverage(pattern: PatternData) {
    return validatePatternCoverage(pattern);
  }
}
