// Newton fractal: Newton's method on f(z) = z³ − 1. Cyclic palette per
// basin with stride indexing (FCG-SPECv3 §5.3).
import type { RenderContext, Renderer } from './types.js';
import { writeRgb } from './types.js';

const TOL_SQ = 1e-6;
const SPAN = 3.0;
const PALETTE_STRIDE = 64;
const CYCLE_LENGTH = 256;

interface NewtonResult {
  readonly root: number;
  readonly iter: number;
}

// Roots of z³ − 1.
const ROOTS: readonly (readonly [number, number])[] = [
  [1, 0],
  [-0.5, Math.sqrt(3) / 2],
  [-0.5, -Math.sqrt(3) / 2],
];

export const newton: Renderer = {
  id: 'NEWTON',
  render: (ctx: RenderContext): Uint8ClampedArray => {
    const { width, height, iterations, zoom, palette } = ctx;
    const out = new Uint8ClampedArray(width * height * 4);
    const dRe = SPAN / zoom / width;
    const dIm = SPAN / zoom / height;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const zRe = x * dRe;
        const zIm = y * dIm;
        const r = newtonIter(zRe, zIm, iterations);
        const idx = (r.root * PALETTE_STRIDE + (r.iter % PALETTE_STRIDE)) % CYCLE_LENGTH;
        writeRgb(out, y * width + x, palette.sampleCyclic(idx, CYCLE_LENGTH));
      }
    }
    return out;
  },
};

const newtonIter = (zRe0: number, zIm0: number, maxIter: number): NewtonResult => {
  let zRe = zRe0;
  let zIm = zIm0;
  for (let i = 0; i < maxIter; i++) {
    const step = newtonStep(zRe, zIm);
    zRe = step[0];
    zIm = step[1];
    const rootIdx = nearestRoot(zRe, zIm);
    if (rootIdx >= 0) return { root: rootIdx, iter: i };
  }
  return { root: 0, iter: maxIter };
};

const newtonStep = (zRe: number, zIm: number): readonly [number, number] => {
  // For f(z) = z³ − 1, Newton's step: z − (z³ − 1) / (3 z²).
  // (z²) → (z²Re, z²Im); (z³) = z² · z.
  const rr = zRe * zRe;
  const ii = zIm * zIm;
  const z2Re = rr - ii;
  const z2Im = 2 * zRe * zIm;
  const z3Re = z2Re * zRe - z2Im * zIm - 1;
  const z3Im = z2Re * zIm + z2Im * zRe;
  // 3 * z² = denominator.
  const dRe = 3 * z2Re;
  const dIm = 3 * z2Im;
  const denom = dRe * dRe + dIm * dIm || Number.EPSILON;
  const qRe = (z3Re * dRe + z3Im * dIm) / denom;
  const qIm = (z3Im * dRe - z3Re * dIm) / denom;
  return [zRe - qRe, zIm - qIm];
};

const nearestRoot = (zRe: number, zIm: number): number => {
  for (let k = 0; k < ROOTS.length; k++) {
    const root = ROOTS[k] ?? ROOTS[0];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [rRe, rIm] = root!;
    const dRe = zRe - rRe;
    const dIm = zIm - rIm;
    if (dRe * dRe + dIm * dIm < TOL_SQ) return k;
  }
  return -1;
};
