// Complex Function Phase Plot: f(z) ∈ { z², sin(z), exp(z) }.
// Brightness floor ≥ 0.5 (FCG-SPECv3 §5.3); no near-black regions (§5.4).
import type { RenderContext, Renderer } from './types.js';
import { writeRgb } from './types.js';

const SPAN = 6.0;
const TWO_PI = Math.PI * 2;
const BRIGHT_BASE = 0.62;
const BRIGHT_AMP = 0.34; // base + amp ≤ 1.0

type ComplexFn = (re: number, im: number) => readonly [number, number];

const FN_SQ: ComplexFn = (re, im) => [re * re - im * im, 2 * re * im];
const FN_SIN: ComplexFn = (re, im) => [Math.sin(re) * Math.cosh(im), Math.cos(re) * Math.sinh(im)];
const FN_EXP: ComplexFn = (re, im) => [Math.exp(re) * Math.cos(im), Math.exp(re) * Math.sin(im)];

const FNS: readonly ComplexFn[] = [FN_SQ, FN_SIN, FN_EXP];

export const phasePlot: Renderer = {
  id: 'PHASE_PLOT',
  render: (ctx: RenderContext): Uint8ClampedArray => {
    const { width, height, zoom, rng, palette } = ctx;
    const out = new Uint8ClampedArray(width * height * 4);
    const fn = FNS[Math.floor(rng() * FNS.length)] ?? FN_SQ;
    const dRe = SPAN / zoom / width;
    const dIm = SPAN / zoom / height;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const re = x * dRe - SPAN / (2 * zoom);
        const im = y * dIm - SPAN / (2 * zoom);
        const [fRe, fIm] = fn(re, im);
        writePhasePixel(out, y * width + x, fRe, fIm, palette);
      }
    }
    return out;
  },
};

const writePhasePixel = (
  buf: Uint8ClampedArray,
  idx: number,
  fRe: number,
  fIm: number,
  palette: { sample: (t: number) => { r: number; g: number; b: number } },
): void => {
  const arg = Math.atan2(fIm, fRe); // -π..π
  const mag = Math.sqrt(fRe * fRe + fIm * fIm) + 1e-9;
  const t = (arg + Math.PI) / TWO_PI; // 0..1
  const base = palette.sample(t);
  const brightness = BRIGHT_BASE + BRIGHT_AMP * Math.abs(Math.sin(Math.PI * Math.log(mag)));
  const b = Math.max(BRIGHT_BASE, Math.min(1, brightness));
  const color = { r: Math.round(base.r * b), g: Math.round(base.g * b), b: Math.round(base.b * b) };
  writeRgb(buf, idx, color);
};
