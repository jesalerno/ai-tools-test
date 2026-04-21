// Fractal renderer contract.
// Every renderer consumes a RenderContext and produces an RGBA pixel buffer
// sized `width * height * 4` (one quadrant). Strict rules from
// FCG-SPECv3 §3.4 apply: no variadic spread over large arrays, no unbounded
// recursion, no in-loop allocation, explicit iteration cap.

import type { FractalMethod } from '../../shared/types.js';
import type { Palette, RgbColor } from '../color/palette.js';
import type { Rng } from '../rng.js';

export interface RenderContext {
  readonly width: number;
  readonly height: number;
  readonly iterations: number;
  readonly zoom: number;
  readonly rng: Rng;
  readonly palette: Palette;
  readonly background: RgbColor;
}

export interface Renderer {
  readonly id: FractalMethod;
  readonly render: (ctx: RenderContext) => Uint8ClampedArray;
}

export const writeRgb = (
  buf: Uint8ClampedArray,
  idx: number,
  color: RgbColor,
): void => {
  const o = idx * 4;
  buf[o] = color.r;
  buf[o + 1] = color.g;
  buf[o + 2] = color.b;
  buf[o + 3] = 255;
};

export const fillBackground = (
  buf: Uint8ClampedArray,
  width: number,
  height: number,
  bg: RgbColor,
): void => {
  const total = width * height;
  for (let i = 0; i < total; i++) writeRgb(buf, i, bg);
};
