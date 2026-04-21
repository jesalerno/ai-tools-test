// Lyapunov fractal: symbolic logistic-map sequences.
// FCG-SPECv3 §5.3: stable regions (negative exponent) must use dark palette
// tint (10–20% brightness), NOT solid black.
import type { RenderContext, Renderer } from './types.js';
import { writeRgb, fillBackground } from './types.js';

const A_MIN = 2.5;
const A_MAX = 4.0;
const B_MIN = 2.5;
const B_MAX = 4.0;
const WARMUP = 100;
const SAMPLE = 300;
const STABLE_TINT = 0.18;

const SEQUENCES: readonly (readonly number[])[] = [
  [0, 1],
  [0, 0, 1],
  [0, 1, 1],
  [0, 1, 0, 1, 1],
  [0, 0, 1, 1],
];

export const lyapunov: Renderer = {
  id: 'LYAPUNOV',
  render: (ctx: RenderContext): Uint8ClampedArray => {
    const { width, height, rng, palette, background } = ctx;
    const out = new Uint8ClampedArray(width * height * 4);
    fillBackground(out, width, height, background);
    const seqIdx = Math.floor(rng() * SEQUENCES.length);
    const seq = SEQUENCES[seqIdx] ?? SEQUENCES[0];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const safeSeq = seq!;
    const dA = (A_MAX - A_MIN) / width;
    const dB = (B_MAX - B_MIN) / height;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const a = A_MIN + x * dA;
        const b = B_MIN + y * dB;
        const lambda = lyapExponent(a, b, safeSeq);
        writeLyapPixel(out, y * width + x, lambda, palette);
      }
    }
    return out;
  },
};

const lyapExponent = (a: number, b: number, seq: readonly number[]): number => {
  let xN = 0.5;
  for (let i = 0; i < WARMUP; i++) {
    const r = seq[i % seq.length] === 0 ? a : b;
    xN = r * xN * (1 - xN);
  }
  let sum = 0;
  for (let i = 0; i < SAMPLE; i++) {
    const r = seq[i % seq.length] === 0 ? a : b;
    xN = r * xN * (1 - xN);
    const d = r * (1 - 2 * xN);
    const abs = Math.abs(d);
    if (abs > 0) sum += Math.log(abs);
  }
  return sum / SAMPLE;
};

const writeLyapPixel = (
  buf: Uint8ClampedArray,
  idx: number,
  lambda: number,
  palette: { sample: (t: number) => { r: number; g: number; b: number }; tint: (c: { r: number; g: number; b: number }, f: number) => { r: number; g: number; b: number } },
): void => {
  if (lambda < 0) {
    // Stable region: dark palette tint (never solid black).
    const t = Math.min(1, -lambda);
    const base = palette.sample(0.15 + 0.1 * t);
    writeRgb(buf, idx, palette.tint(base, STABLE_TINT + 0.12 * t));
    return;
  }
  // Chaotic region: bright palette index proportional to exponent.
  const t = Math.min(1, lambda * 1.8);
  writeRgb(buf, idx, palette.sample(0.45 + 0.55 * t));
};
