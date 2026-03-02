import type {FractalGenerator} from './types';
import {colorForIteration, createBufferWithBase, finishCoverage, normalizePoint} from './common';

interface Root {
  x: number;
  y: number;
}

const ROOTS: Root[] = [
  {x: 1, y: 0},
  {x: -0.5, y: Math.sqrt(3) / 2},
  {x: -0.5, y: -Math.sqrt(3) / 2},
];

function iterateNewton(x0: number, y0: number, maxIterations: number): {root: number; iteration: number} {
  let x = x0;
  let y = y0;
  let iteration = 0;

  while (iteration < maxIterations) {
    const x2 = x * x;
    const y2 = y * y;
    const x3 = x * (x2 - 3 * y2);
    const y3 = y * (3 * x2 - y2);
    const fx = x3 - 1;
    const fy = y3;

    const dfx = 3 * (x2 - y2);
    const dfy = 6 * x * y;
    const denom = dfx * dfx + dfy * dfy;

    if (denom < 1e-12) {
      break;
    }

    const nx = x - (fx * dfx + fy * dfy) / denom;
    const ny = y - (fy * dfx - fx * dfy) / denom;

    if (Math.hypot(nx - x, ny - y) < 1e-6) {
      x = nx;
      y = ny;
      break;
    }

    x = nx;
    y = ny;
    iteration += 1;
  }

  let rootIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  ROOTS.forEach((root, index) => {
    const distance = Math.hypot(x - root.x, y - root.y);
    if (distance < bestDistance) {
      bestDistance = distance;
      rootIndex = index;
    }
  });

  return {root: rootIndex, iteration: Math.min(maxIterations, iteration)};
}

export const generateNewton: FractalGenerator = context => {
  const buffer = createBufferWithBase(context);

  for (let y = 0; y < context.height; y += 1) {
    context.assertWithinBudget();

    for (let x = 0; x < context.width; x += 1) {
      const normalized = normalizePoint(x, y, context);
      const result = iterateNewton(normalized.cx, normalized.cy, context.iterations);
      const index = (y * context.width + x) * 4;
      const bias = (result.root + 1) / (ROOTS.length + 1);
      const color = colorForIteration((result.iteration / context.iterations + bias) / 2, 1, context);

      buffer.data[index] = color.r;
      buffer.data[index + 1] = color.g;
      buffer.data[index + 2] = color.b;
      buffer.data[index + 3] = 255;
    }
  }

  return {buffer, coverage: finishCoverage(buffer)};
};
