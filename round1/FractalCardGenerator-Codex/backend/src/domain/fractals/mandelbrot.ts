import type {FractalGenerator} from './types';
import {colorForIteration, createBufferWithBase, finishCoverage, normalizePoint} from './common';

function iterateMandelbrot(cx: number, cy: number, maxIterations: number): number {
  let zx = 0;
  let zy = 0;
  let iteration = 0;

  while (zx * zx + zy * zy <= 4 && iteration < maxIterations) {
    const nextX = zx * zx - zy * zy + cx;
    zy = 2 * zx * zy + cy;
    zx = nextX;
    iteration += 1;
  }

  return iteration;
}

export const generateMandelbrot: FractalGenerator = context => {
  const buffer = createBufferWithBase(context);
  const centerX = -0.55 + ((context.seed % 29) - 14) * 0.01;
  const centerY = ((context.seed % 19) - 9) * 0.01;

  for (let y = 0; y < context.height; y += 1) {
    context.assertWithinBudget();

    for (let x = 0; x < context.width; x += 1) {
      const normalized = normalizePoint(x, y, context);
      const cx = normalized.cx + centerX;
      const cy = normalized.cy + centerY;
      const iteration = iterateMandelbrot(cx, cy, context.iterations);
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
