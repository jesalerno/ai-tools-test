import type {FractalGenerator} from './types';
import {colorForIteration, createBufferWithBase, finishCoverage} from './common';

function hash2d(x: number, y: number, seed: number): number {
  const n = x * 374761393 + y * 668265263 + seed * 2654435761;
  const value = (n ^ (n >>> 13)) * 1274126177;
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
}

function smoothStep(t: number): number {
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function valueNoise(x: number, y: number, seed: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const xf = x - x0;
  const yf = y - y0;

  const n00 = hash2d(x0, y0, seed);
  const n10 = hash2d(x0 + 1, y0, seed);
  const n01 = hash2d(x0, y0 + 1, seed);
  const n11 = hash2d(x0 + 1, y0 + 1, seed);

  const u = smoothStep(xf);
  const v = smoothStep(yf);
  const nx0 = lerp(n00, n10, u);
  const nx1 = lerp(n01, n11, u);
  return lerp(nx0, nx1, v);
}

function fractalNoise(x: number, y: number, seed: number): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;

  for (let oct = 0; oct < 5; oct += 1) {
    value += valueNoise(x * frequency, y * frequency, seed + oct * 37) * amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value;
}

export const generateEscapeHeightmap: FractalGenerator = context => {
  const buffer = createBufferWithBase(context);
  const scale = 0.02 * context.zoom;

  for (let y = 0; y < context.height; y += 1) {
    if (y % 8 === 0) {
      context.assertWithinBudget();
    }

    for (let x = 0; x < context.width; x += 1) {
      const height = fractalNoise(x * scale, y * scale, context.seed);
      const ridges = Math.abs(Math.sin(height * Math.PI * 2));
      const color = colorForIteration(ridges, 1, context);
      const index = (y * context.width + x) * 4;

      buffer.data[index] = color.r;
      buffer.data[index + 1] = color.g;
      buffer.data[index + 2] = color.b;
      buffer.data[index + 3] = 255;
    }
  }

  return {buffer, coverage: finishCoverage(buffer)};
};
