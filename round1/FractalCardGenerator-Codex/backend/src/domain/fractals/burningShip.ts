import type {FractalGenerator} from './types';
import {colorForIteration, createBufferWithBase, finishCoverage, normalizePoint} from './common';

function iterateBurningShip(cx: number, cy: number, maxIterations: number): number {
  let zx = 0;
  let zy = 0;
  let iteration = 0;

  while (zx * zx + zy * zy <= 4 && iteration < maxIterations) {
    const absX = Math.abs(zx);
    const absY = Math.abs(zy);
    const nextX = absX * absX - absY * absY + cx;
    zy = 2 * absX * absY + cy;
    zx = nextX;
    iteration += 1;
  }

  return iteration;
}

export const generateBurningShip: FractalGenerator = context => {
  const buffer = createBufferWithBase(context);

  for (let y = 0; y < context.height; y += 1) {
    context.assertWithinBudget();

    for (let x = 0; x < context.width; x += 1) {
      const normalized = normalizePoint(x, y, context);
      const cx = normalized.cx - 0.35;
      const cy = normalized.cy - 0.3;
      const iteration = iterateBurningShip(cx, cy, context.iterations);
      const index = (y * context.width + x) * 4;
      const color = colorForIteration(iteration, context.iterations, context);

      if (iteration >= context.iterations) {
        continue;
      }

      buffer.data[index] = color.r;
      buffer.data[index + 1] = color.g;
      buffer.data[index + 2] = color.b;
      buffer.data[index + 3] = 255;
    }
  }

  return {buffer, coverage: finishCoverage(buffer)};
};
