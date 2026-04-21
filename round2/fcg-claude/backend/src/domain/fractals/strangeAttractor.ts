// Strange Attractor — Clifford attractor plotted with log-density mapping
// and alpha blend aesthetic (FCG-SPECv3 §4.8, §5.3).
import type { RenderContext, Renderer } from './types.js';
import { fillBackground, writeRgb } from './types.js';
import { findMaxDensity, logDensityNormalize } from '../raster/density.js';
import { ATTRACTOR_ITER_PER_PIXEL } from '../constants.js';

const GAMMA = 0.38;
// Clifford attractor range is roughly ±2.2; tighten slightly so the
// full attractor fills a folded quadrant without heavy clipping.
const BOUND = 2.3;

// Curated Clifford attractor parameter quadruples.
const PARAMS: readonly (readonly [number, number, number, number])[] = [
  [-1.7, 1.3, -0.1, -1.21],
  [-1.4, 1.6, 1.0, 0.7],
  [1.7, 1.7, 0.6, 1.2],
  [-1.8, -2.0, -0.5, -0.9],
  [1.5, -1.8, 1.6, 0.9],
];

export const strangeAttractor: Renderer = {
  id: 'STRANGE_ATTRACTOR',
  render: (ctx: RenderContext): Uint8ClampedArray => {
    const { width, height, iterations, rng, palette, background } = ctx;
    const out = new Uint8ClampedArray(width * height * 4);
    fillBackground(out, width, height, background);
    const density = new Uint32Array(width * height);
    const pick = PARAMS[Math.floor(rng() * PARAMS.length)] ?? PARAMS[0];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [a, b, c, d] = pick!;
    const iters = Math.max(iterations * 150, width * height * ATTRACTOR_ITER_PER_PIXEL);
    runAttractor(density, width, height, iters, a, b, c, d);
    colorize(out, density, width, height, palette);
    return out;
  },
};

const runAttractor = (
  density: Uint32Array,
  w: number,
  h: number,
  iters: number,
  a: number,
  b: number,
  c: number,
  d: number,
): void => {
  let x = 0.1;
  let y = 0.1;
  // quadrant(0, 0) is the card center after mirroring. Fold the attractor
  // into the positive-axis quadrant so it fills [0, w) × [0, h) and the
  // 4-way mirror reconstructs the full attractor around the card center.
  const xScale = (w - 1) / BOUND;
  const yScale = (h - 1) / BOUND;
  for (let i = 0; i < iters; i++) {
    const nx = Math.sin(a * y) + c * Math.cos(a * x);
    const ny = Math.sin(b * x) + d * Math.cos(b * y);
    x = nx;
    y = ny;
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
    writeRgb(out, i, palette.sample(0.15 + 0.85 * t));
  }
};
