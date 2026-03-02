import type {FractalGenerator} from './types';
import {createBufferWithBase, finishCoverage} from './common';
import {samplePaletteColor} from '../services/paletteService';
import {paintDot} from '../utils/pixels';
import {createSeededRng} from '../utils/random';

interface FlameTransform {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

const TRANSFORMS: FlameTransform[] = [
  {a: 0.6, b: 0.2, c: -0.2, d: 0.6, e: 0.1, f: 0.0},
  {a: 0.5, b: -0.4, c: 0.4, d: 0.5, e: -0.05, f: 0.1},
  {a: 0.7, b: 0.1, c: -0.3, d: 0.7, e: 0.0, f: -0.1},
];

function variation(x: number, y: number, variant: number): {x: number; y: number} {
  if (variant === 0) {
    return {x: Math.sin(x), y: Math.sin(y)};
  }

  if (variant === 1) {
    const r2 = x * x + y * y + 1e-6;
    return {x: x / r2, y: y / r2};
  }

  return {
    x: x * Math.sin(radians(y * 45)),
    y: y * Math.cos(radians(x * 45)),
  };
}

function radians(value: number): number {
  return (value * Math.PI) / 180;
}

export const generateFlame: FractalGenerator = context => {
  const buffer = createBufferWithBase(context);
  const rng = createSeededRng(context.seed + 97);
  const samples = Math.max(200000, context.iterations * 220);

  let x = 0.05;
  let y = 0.01;

  for (let i = 0; i < samples; i += 1) {
    if (i % 5000 === 0) {
      context.assertWithinBudget();
    }

    const transform = TRANSFORMS[rng.int(0, TRANSFORMS.length - 1)];
    const tx = transform.a * x + transform.b * y + transform.e;
    const ty = transform.c * x + transform.d * y + transform.f;
    const warped = variation(tx, ty, rng.int(0, 2));
    x = warped.x;
    y = warped.y;

    const px = Math.floor(((x + 2) / 4) * (context.width - 1));
    const py = Math.floor(((y + 2) / 4) * (context.height - 1));
    const color = samplePaletteColor((i % 8000) / 8000, context.palette);
    paintDot(buffer, px, py, color, 1.1);
  }

  return {buffer, coverage: finishCoverage(buffer)};
};
