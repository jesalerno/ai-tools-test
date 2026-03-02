import type {FractalGenerator} from './types';
import {colorForIteration, createBufferWithBase, finishCoverage, normalizePoint} from './common';

function iterateJulia(zxStart: number, zyStart: number, cx: number, cy: number, maxIterations: number): number {
  let zx = zxStart;
  let zy = zyStart;
  let iteration = 0;

  while (zx * zx + zy * zy <= 4 && iteration < maxIterations) {
    const nextX = zx * zx - zy * zy + cx;
    zy = 2 * zx * zy + cy;
    zx = nextX;
    iteration += 1;
  }

  return iteration;
}

export const generateJulia: FractalGenerator = context => {
  const buffer = createBufferWithBase(context);
  const cx = -0.8 + ((context.seed % 31) / 31) * 1.2;
  const cy = -0.25 + ((context.seed % 53) / 53) * 0.5;

  for (let y = 0; y < context.height; y += 1) {
    context.assertWithinBudget();

    for (let x = 0; x < context.width; x += 1) {
      const normalized = normalizePoint(x, y, context);
      const iteration = iterateJulia(normalized.cx, normalized.cy, cx, cy, context.iterations);
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
