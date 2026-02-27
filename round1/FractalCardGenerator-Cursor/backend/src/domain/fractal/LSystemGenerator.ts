import { FractalGenerator, FractalOptions } from './FractalGenerator';

/**
 * L-System Fractal Generator
 * Generates fractal patterns using L-system string rewriting
 */
export class LSystemGenerator implements FractalGenerator {
  generate(
    width: number,
    height: number,
    options: FractalOptions = {}
  ): number[][] {
    const iterations = options.maxIterations as number ?? 4;
    const type = options.type as string ?? 'dragon';

    // Dragon curve L-system
    const dragonRules: { axiom: string; rules: Record<string, string> } = {
      axiom: 'FX',
      rules: {
        X: 'X+YF+',
        Y: '-FX-Y',
      },
    };

    // Koch curve L-system
    const kochRules: { axiom: string; rules: Record<string, string> } = {
      axiom: 'F',
      rules: {
        F: 'F+F-F-F+F',
      },
    };

    const rules = type === 'dragon' ? dragonRules : kochRules;
    let sentence = rules.axiom;

    // Apply rewrite rules
    for (let i = 0; i < iterations; i++) {
      let newSentence = '';
      for (const char of sentence) {
        newSentence += rules.rules[char] || char;
      }
      sentence = newSentence;
    }

    // Render using turtle graphics
    const result: number[][] = Array(height)
      .fill(0)
      .map(() => Array(width).fill(0));

    let x = width / 2;
    let y = height / 2;
    let angle = 0;
    const step = type === 'dragon' ? 2 : 1;
    const angleStep = Math.PI / 2;

    for (const char of sentence) {
      if (char === 'F') {
        const newX = x + Math.cos(angle) * step;
        const newY = y + Math.sin(angle) * step;

        // Draw line
        this.drawLine(result, x, y, newX, newY, width, height);

        x = newX;
        y = newY;
      } else if (char === '+') {
        angle += angleStep;
      } else if (char === '-') {
        angle -= angleStep;
      }
    }

    return result;
  }

  private drawLine(
    canvas: number[][],
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    width: number,
    height: number
  ): void {
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = Math.floor(x1 + (x2 - x1) * t);
      const y = Math.floor(y1 + (y2 - y1) * t);

      if (x >= 0 && x < width && y >= 0 && y < height) {
        canvas[y][x] = 255;
      }
    }
  }
}
