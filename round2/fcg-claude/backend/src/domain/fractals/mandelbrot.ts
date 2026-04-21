// Mandelbrot set: iterate z = z² + c. Log-mapped palette per FCG-SPECv3 §5.3.
import type { RenderContext, Renderer } from './types.js';
import { writeRgb } from './types.js';

const BAILOUT = 4.0;
const RE_SPAN = 2.2;
const IM_SPAN = 2.5;
const LOG2 = Math.log(2);

export const mandelbrot: Renderer = {
  id: 'MANDELBROT',
  render: (ctx: RenderContext): Uint8ClampedArray => {
    const { width, height, iterations, zoom, palette } = ctx;
    const out = new Uint8ClampedArray(width * height * 4);
    const dRe = RE_SPAN / zoom / width;
    const dIm = IM_SPAN / zoom / height;
    const logMax = Math.log(iterations + 1);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cRe = x * dRe;
        const cIm = y * dIm;
        const t = smoothIter(cRe, cIm, iterations) / iterations;
        const logIdx = Math.log(t * iterations + 1) / logMax;
        writeRgb(out, y * width + x, palette.sample(logIdx));
      }
    }
    return out;
  },
};

const smoothIter = (cRe: number, cIm: number, maxIter: number): number => {
  let zRe = 0;
  let zIm = 0;
  for (let i = 0; i < maxIter; i++) {
    const rr = zRe * zRe;
    const ii = zIm * zIm;
    if (rr + ii > BAILOUT) {
      const logZn = Math.log(rr + ii) / 2;
      const nu = Math.log(logZn / LOG2) / LOG2;
      return i + 1 - nu;
    }
    zIm = 2 * zRe * zIm + cIm;
    zRe = rr - ii + cRe;
  }
  return maxIter;
};
