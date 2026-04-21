// Burning Ship: iterate z = (|Re(z)| + i|Im(z)|)² + c. Log-mapped (§5.3).
import type { RenderContext, Renderer } from './types.js';
import { writeRgb } from './types.js';

const BAILOUT = 4.0;
const RE_SPAN = 2.5;
const IM_SPAN = 2.5;
const RE_OFFSET = -1.75;
const IM_OFFSET = -0.05;

export const burningShip: Renderer = {
  id: 'BURNING_SHIP',
  render: (ctx: RenderContext): Uint8ClampedArray => {
    const { width, height, iterations, zoom, palette } = ctx;
    const out = new Uint8ClampedArray(width * height * 4);
    const dRe = RE_SPAN / zoom / width;
    const dIm = IM_SPAN / zoom / height;
    const logMax = Math.log(iterations + 1);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cRe = RE_OFFSET + x * dRe;
        const cIm = IM_OFFSET + y * dIm;
        const iter = escape(cRe, cIm, iterations);
        const idx = Math.log(iter + 1) / logMax;
        writeRgb(out, y * width + x, palette.sample(idx));
      }
    }
    return out;
  },
};

const escape = (cRe: number, cIm: number, maxIter: number): number => {
  let zRe = 0;
  let zIm = 0;
  for (let i = 0; i < maxIter; i++) {
    const ar = Math.abs(zRe);
    const ai = Math.abs(zIm);
    const rr = ar * ar;
    const ii = ai * ai;
    if (rr + ii > BAILOUT) return i;
    zIm = 2 * ar * ai + cIm;
    zRe = rr - ii + cRe;
  }
  return maxIter;
};
