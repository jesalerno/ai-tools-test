// Flame Fractal — probabilistic IFS with non-linear variations.
// Spec §5.3: uniform-random transform per iteration (no round-robin),
// warmup ≥ 20 iterations discarded, log-density gamma ≤ 0.5.
import type { RenderContext, Renderer } from './types.js';
import { fillBackground, writeRgb } from './types.js';
import { findMaxDensity, logDensityNormalize } from '../raster/density.js';
import { FLAME_WARMUP_ITER } from '../constants.js';
import type { Rng } from '../rng.js';

const GAMMA = 0.35;

interface FlameTransform {
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly d: number;
  readonly e: number;
  readonly f: number;
  readonly variation: number; // 0=linear, 1=sinusoidal, 2=spherical, 3=swirl
}

const randomAffine = (rng: Rng): FlameTransform => ({
  a: rng() * 1.8 - 0.9,
  b: rng() * 1.8 - 0.9,
  c: rng() * 1.8 - 0.9,
  d: rng() * 1.8 - 0.9,
  e: rng() * 1.2 - 0.6,
  f: rng() * 1.2 - 0.6,
  variation: Math.floor(rng() * 4),
});

const applyVariation = (
  t: FlameTransform,
  x: number,
  y: number,
): readonly [number, number] => {
  const lx = t.a * x + t.b * y + t.e;
  const ly = t.c * x + t.d * y + t.f;
  switch (t.variation) {
    case 1:
      return [Math.sin(lx), Math.sin(ly)];
    case 2: {
      const r2 = lx * lx + ly * ly + 1e-6;
      return [lx / r2, ly / r2];
    }
    case 3: {
      const r = lx * lx + ly * ly;
      return [lx * Math.sin(r) - ly * Math.cos(r), lx * Math.cos(r) + ly * Math.sin(r)];
    }
    default:
      return [lx, ly];
  }
};

export const flame: Renderer = {
  id: 'FLAME',
  render: (ctx: RenderContext): Uint8ClampedArray => {
    const { width, height, iterations, rng, palette, background } = ctx;
    const out = new Uint8ClampedArray(width * height * 4);
    fillBackground(out, width, height, background);
    const density = new Uint32Array(width * height);
    const transforms = buildTransforms(rng);
    const iters = Math.max(iterations * 120, width * height * 12);
    chaos(density, width, height, iters, transforms, rng);
    colorize(out, density, width, height, palette);
    return out;
  },
};

const buildTransforms = (rng: Rng): readonly FlameTransform[] => {
  const n = 3 + Math.floor(rng() * 2);
  const xs: FlameTransform[] = [];
  for (let i = 0; i < n; i++) xs.push(randomAffine(rng));
  return xs;
};

// Flame affines with variations can sprawl to ±3; we fold |x|, |y| into the
// card-center-anchored quadrant so the 4-way mirror yields one full flame
// spanning the card rather than four small copies in the corners.
const FLAME_BOUND = 2.4;

const chaos = (
  density: Uint32Array,
  w: number,
  h: number,
  iters: number,
  transforms: readonly FlameTransform[],
  rng: Rng,
): void => {
  let x = rng() * 2 - 1;
  let y = rng() * 2 - 1;
  const xScale = (w - 1) / FLAME_BOUND;
  const yScale = (h - 1) / FLAME_BOUND;
  for (let i = 0; i < iters; i++) {
    const idx = Math.floor(rng() * transforms.length);
    const t = transforms[idx] ?? transforms[0];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const next = applyVariation(t!, x, y);
    x = next[0];
    y = next[1];
    if (i < FLAME_WARMUP_ITER) continue;
    const px = Math.floor(Math.abs(x) * xScale);
    const py = Math.floor(Math.abs(y) * yScale);
    if (px < w && py < h) {
      density[py * w + px] = (density[py * w + px] ?? 0) + 1;
    }
  }
};

const colorize = (
  out: Uint8ClampedArray,
  density: Uint32Array,
  w: number,
  h: number,
  palette: { sample: (t: number) => { r: number; g: number; b: number } },
): void => {
  const max = findMaxDensity(density);
  const total = w * h;
  for (let i = 0; i < total; i++) {
    const d = density[i] ?? 0;
    if (d === 0) continue;
    const t = logDensityNormalize(d, max, GAMMA);
    writeRgb(out, i, palette.sample(0.18 + 0.82 * t));
  }
};
