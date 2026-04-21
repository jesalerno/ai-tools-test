// Julia set: iterate z = z² + c for fixed c. Log-mapped palette (§5.3).
import type { RenderContext, Renderer } from './types.js';
import { writeRgb } from './types.js';

const BAILOUT = 4.0;
const SPAN = 3.2;
const LOG2 = Math.log(2);

// Curated aesthetic c values; random pick per render.
const JULIA_CS: readonly (readonly [number, number])[] = [
  [-0.7, 0.27015],
  [-0.8, 0.156],
  [0.285, 0.01],
  [-0.4, 0.6],
  [0.355534, -0.337292],
  [-0.75, 0.11],
];

export const julia: Renderer = {
  id: 'JULIA',
  render: (ctx: RenderContext): Uint8ClampedArray => {
    const { width, height, iterations, zoom, rng, palette } = ctx;
    const out = new Uint8ClampedArray(width * height * 4);
    const idx = Math.floor(rng() * JULIA_CS.length);
    const pick = JULIA_CS[idx] ?? JULIA_CS[0];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [cRe, cIm] = pick!;
    const dx = SPAN / zoom / width;
    const dy = SPAN / zoom / height;
    const logMax = Math.log(iterations + 1);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const zx = x * dx;
        const zy = y * dy;
        const iter = smoothIter(zx, zy, cRe, cIm, iterations);
        const idxNorm = Math.log(iter + 1) / logMax;
        writeRgb(out, y * width + x, palette.sample(idxNorm));
      }
    }
    return out;
  },
};

const smoothIter = (
  zRe0: number,
  zIm0: number,
  cRe: number,
  cIm: number,
  maxIter: number,
): number => {
  let zRe = zRe0;
  let zIm = zIm0;
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
