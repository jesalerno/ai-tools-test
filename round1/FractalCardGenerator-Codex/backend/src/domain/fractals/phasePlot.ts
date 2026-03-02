import Complex from 'complex.js';

import type {FractalGenerator} from './types';
import {colorForIteration, createBufferWithBase, finishCoverage, normalizePoint} from './common';

function mapMagnitude(magnitude: number): number {
  const scaled = Math.log1p(magnitude) / Math.log(8);
  return Math.max(0, Math.min(1, scaled));
}

export const generatePhasePlot: FractalGenerator = context => {
  const buffer = createBufferWithBase(context);

  for (let y = 0; y < context.height; y += 1) {
    if (y % 4 === 0) {
      context.assertWithinBudget();
    }

    for (let x = 0; x < context.width; x += 1) {
      const normalized = normalizePoint(x, y, context);
      const z = new Complex(normalized.cx * 1.4, normalized.cy * 1.4);
      const value = z.sin().add(z.mul(z));
      const phase = (value.arg() + Math.PI) / (2 * Math.PI);
      const mag = mapMagnitude(value.abs());
      const color = colorForIteration((phase + mag) / 2, 1, context);
      const index = (y * context.width + x) * 4;

      buffer.data[index] = color.r;
      buffer.data[index + 1] = color.g;
      buffer.data[index + 2] = color.b;
      buffer.data[index + 3] = 255;
    }
  }

  return {buffer, coverage: finishCoverage(buffer)};
};
