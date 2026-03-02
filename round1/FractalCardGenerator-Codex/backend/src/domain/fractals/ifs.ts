import type {FractalGenerator} from './types';
import {createBufferWithBase, finishCoverage} from './common';
import {samplePaletteColor} from '../services/paletteService';
import {paintDot} from '../utils/pixels';
import {createSeededRng} from '../utils/random';

interface Transform {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
  weight: number;
}

const BARNSLEY: Transform[] = [
  {a: 0, b: 0, c: 0, d: 0.16, e: 0, f: 0, weight: 0.01},
  {a: 0.85, b: 0.04, c: -0.04, d: 0.85, e: 0, f: 1.6, weight: 0.85},
  {a: 0.2, b: -0.26, c: 0.23, d: 0.22, e: 0, f: 1.6, weight: 0.07},
  {a: -0.15, b: 0.28, c: 0.26, d: 0.24, e: 0, f: 0.44, weight: 0.07},
];

function pickTransform(value: number): Transform {
  let cumulative = 0;
  for (const transform of BARNSLEY) {
    cumulative += transform.weight;
    if (value <= cumulative) {
      return transform;
    }
  }

  return BARNSLEY[BARNSLEY.length - 1];
}

export const generateIfs: FractalGenerator = context => {
  const buffer = createBufferWithBase(context);
  const rng = createSeededRng(context.seed + 17);
  const samples = Math.max(150000, context.iterations * 180);
  let x = 0;
  let y = 0;

  for (let i = 0; i < samples; i += 1) {
    if (i % 4000 === 0) {
      context.assertWithinBudget();
    }

    const transform = pickTransform(rng.next());
    const nextX = transform.a * x + transform.b * y + transform.e;
    const nextY = transform.c * x + transform.d * y + transform.f;
    x = nextX;
    y = nextY;

    const px = Math.floor(((x + 2.182) / 4.8378) * (context.width - 1));
    const py = Math.floor((1 - y / 10) * (context.height - 1));
    const color = samplePaletteColor((i % 5000) / 5000, context.palette);
    paintDot(buffer, px, py, color, 1.3);
  }

  return {buffer, coverage: finishCoverage(buffer)};
};
