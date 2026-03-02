import type {FractalGenerator} from './types';
import {colorForIteration, createBufferWithBase, finishCoverage} from './common';

const SEQUENCE = ['A', 'B', 'A', 'B', 'B', 'A', 'A', 'B'];

function lyapunovExponent(a: number, b: number, iterations: number): number {
  let x = 0.5;
  let sum = 0;

  for (let i = 0; i < iterations; i += 1) {
    const rate = SEQUENCE[i % SEQUENCE.length] === 'A' ? a : b;
    x = rate * x * (1 - x);
    const derivative = Math.abs(rate * (1 - 2 * x));
    sum += Math.log(Math.max(1e-12, derivative));
  }

  return sum / iterations;
}

export const generateLyapunov: FractalGenerator = context => {
  const buffer = createBufferWithBase(context);
  const minRate = 2.5;
  const maxRate = 4;

  for (let y = 0; y < context.height; y += 1) {
    context.assertWithinBudget();

    for (let x = 0; x < context.width; x += 1) {
      const a = minRate + (x / context.width) * (maxRate - minRate);
      const b = minRate + (y / context.height) * (maxRate - minRate);
      const exponent = lyapunovExponent(a, b, Math.max(80, Math.floor(context.iterations / 4)));
      const value = Math.max(0, Math.min(1, (exponent + 2) / 4));
      const color = colorForIteration(value, 1, context);
      const index = (y * context.width + x) * 4;

      buffer.data[index] = color.r;
      buffer.data[index + 1] = color.g;
      buffer.data[index + 2] = color.b;
      buffer.data[index + 3] = 255;
    }
  }

  return {buffer, coverage: finishCoverage(buffer)};
};
