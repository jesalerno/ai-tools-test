// IFS chaos game — Barnsley Fern or Sierpiński Triangle. Log-density (§5.3).
import type { RenderContext, Renderer } from './types.js';
import { writeRgb, fillBackground } from './types.js';
import { findMaxDensity, logDensityNormalize } from '../raster/density.js';
import { IFS_CHAOS_ITER_PER_PIXEL } from '../constants.js';

const GAMMA = 0.42;

interface Affine {
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly d: number;
  readonly e: number;
  readonly f: number;
  readonly p: number;
}

// Barnsley Fern (Wikipedia canonical params).
const FERN: readonly Affine[] = [
  { a: 0, b: 0, c: 0, d: 0.16, e: 0, f: 0, p: 0.01 },
  { a: 0.85, b: 0.04, c: -0.04, d: 0.85, e: 0, f: 1.6, p: 0.85 },
  { a: 0.2, b: -0.26, c: 0.23, d: 0.22, e: 0, f: 1.6, p: 0.07 },
  { a: -0.15, b: 0.28, c: 0.26, d: 0.24, e: 0, f: 0.44, p: 0.07 },
];

export const ifs: Renderer = {
  id: 'IFS',
  render: (ctx: RenderContext): Uint8ClampedArray => {
    const { width, height, iterations, palette, background, rng } = ctx;
    const out = new Uint8ClampedArray(width * height * 4);
    fillBackground(out, width, height, background);
    const density = new Uint32Array(width * height);
    const iters = Math.max(iterations * 100, width * height * IFS_CHAOS_ITER_PER_PIXEL);
    chaosGame(density, width, height, iters, rng);
    const max = findMaxDensity(density);
    colorize(out, density, width, height, max, palette);
    return out;
  },
};

const chaosGame = (
  density: Uint32Array,
  w: number,
  h: number,
  iters: number,
  rng: () => number,
): void => {
  let x = 0;
  let y = 0;
  for (let i = 0; i < iters; i++) {
    const r = rng();
    const t = pickTransform(r);
    const nx = t.a * x + t.b * y + t.e;
    const ny = t.c * x + t.d * y + t.f;
    x = nx;
    y = ny;
    // Map fern coords roughly to (0,0)..(w,h): fern x ∈ [-2.1..2.7], y ∈ [0..10].
    const px = Math.floor(((x + 2.1) / 4.8) * w);
    const py = Math.floor(h - (y / 10) * h);
    if (px >= 0 && px < w && py >= 0 && py < h) density[py * w + px] = (density[py * w + px] ?? 0) + 1;
  }
};

const pickTransform = (r: number): Affine => {
  let acc = 0;
  for (let k = 0; k < FERN.length; k++) {
    const t = FERN[k] ?? FERN[0];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    acc += t!.p;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (r <= acc) return t!;
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return FERN[FERN.length - 1]!;
};

const colorize = (
  out: Uint8ClampedArray,
  density: Uint32Array,
  w: number,
  h: number,
  max: number,
  palette: { sample: (t: number) => { r: number; g: number; b: number } },
): void => {
  const total = w * h;
  for (let i = 0; i < total; i++) {
    const d = density[i] ?? 0;
    if (d === 0) continue;
    const t = logDensityNormalize(d, max, GAMMA);
    writeRgb(out, i, palette.sample(0.2 + 0.8 * t));
  }
};
