import type {FractalGenerator} from './types';
import {createBufferWithBase, finishCoverage} from './common';
import {samplePaletteColor} from '../services/paletteService';
import {paintDot} from '../utils/pixels';

function mapAttractor(x: number, y: number, a: number, b: number, c: number, d: number): {x: number; y: number} {
  return {
    x: Math.sin(a * y) - Math.cos(b * x),
    y: Math.sin(c * x) - Math.cos(d * y),
  };
}

export const generateStrangeAttractor: FractalGenerator = context => {
  const buffer = createBufferWithBase(context);
  const a = 1.4 + (context.seed % 100) / 500;
  const b = -2.3 + (context.seed % 120) / 600;
  const c = 2.4 + (context.seed % 90) / 400;
  const d = -2.1 + (context.seed % 80) / 500;
  const samples = Math.max(180000, context.iterations * 220);

  let x = 0.1;
  let y = 0;

  for (let i = 0; i < samples; i += 1) {
    if (i % 5000 === 0) {
      context.assertWithinBudget();
    }

    const point = mapAttractor(x, y, a, b, c, d);
    x = point.x;
    y = point.y;

    const px = Math.floor(((x + 2) / 4) * (context.width - 1));
    const py = Math.floor(((y + 2) / 4) * (context.height - 1));
    const color = samplePaletteColor((i % 7000) / 7000, context.palette);
    paintDot(buffer, px, py, color, 1.2);
  }

  return {buffer, coverage: finishCoverage(buffer)};
};
