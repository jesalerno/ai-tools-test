// Palette construction: harmony hues → smoothly interpolated RGB LUT.
// The LUT is sampled with `t ∈ [0, 1]` so renderers plug in log-mapped
// iteration counts (escape-time) or log-density (IFS/flame/attractors) to
// avoid the flat-output failure mode documented in FCG-SPECv3 §5.3.

import type { ColorHarmonyMode } from '../../shared/types.js';
import { harmonyHues } from './harmony.js';
import type { Rng } from '../rng.js';

const PALETTE_SIZE = 1024;
const SAT_MIN = 0.55;
const SAT_MAX = 0.95;
const LIGHT_MIN = 0.30;
const LIGHT_MAX = 0.68;
const TWO_PI = Math.PI * 2;

export interface RgbColor {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

export interface Palette {
  readonly size: number;
  readonly mode: ColorHarmonyMode;
  readonly baseHue: number;
  readonly hues: readonly number[];
  readonly lut: Uint8Array; // packed RGB, length = size * 3
  sample(t: number): RgbColor;
  sampleCyclic(index: number, cycleSize: number): RgbColor;
  tint(color: RgbColor, factor: number): RgbColor;
}

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

const hslToRgb = (h: number, s: number, l: number): RgbColor => {
  const hh = ((h % 360) + 360) % 360 / 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hh * 6) % 2) - 1));
  const m = l - c / 2;
  const [r1, g1, b1] = hslSegment(hh, c, x);
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
};

const hslSegment = (hh: number, c: number, x: number): readonly [number, number, number] => {
  const i = Math.floor(hh * 6) % 6;
  if (i === 0) return [c, x, 0];
  if (i === 1) return [x, c, 0];
  if (i === 2) return [0, c, x];
  if (i === 3) return [0, x, c];
  if (i === 4) return [x, 0, c];
  return [c, 0, x];
};

const buildLut = (hues: readonly number[], rng: Rng): Uint8Array => {
  const lut = new Uint8Array(PALETTE_SIZE * 3);
  const satSwing = SAT_MAX - SAT_MIN;
  const lightSwing = LIGHT_MAX - LIGHT_MIN;
  const phase = rng() * TWO_PI;
  for (let i = 0; i < PALETTE_SIZE; i++) {
    const t = i / (PALETTE_SIZE - 1);
    const idx = Math.floor(t * (hues.length - 1));
    const next = Math.min(idx + 1, hues.length - 1);
    const localT = t * (hues.length - 1) - idx;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const hue = lerpHue(hues[idx]!, hues[next]!, localT);
    const s = SAT_MIN + satSwing * (0.5 + 0.5 * Math.sin(phase + t * TWO_PI));
    const l = LIGHT_MIN + lightSwing * (0.5 - 0.5 * Math.cos(phase + t * TWO_PI * 2));
    const { r, g, b } = hslToRgb(hue, s, l);
    lut[i * 3] = r;
    lut[i * 3 + 1] = g;
    lut[i * 3 + 2] = b;
  }
  return lut;
};

const lerpHue = (a: number, b: number, t: number): number => {
  const diff = ((b - a + 540) % 360) - 180;
  return (a + diff * t + 360) % 360;
};

const lutAt = (lut: Uint8Array, idx: number): RgbColor => {
  const i = idx * 3;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return { r: lut[i]!, g: lut[i + 1]!, b: lut[i + 2]! };
};

const createSample =
  (lut: Uint8Array) =>
  (t: number): RgbColor => {
    const tt = clamp01(t);
    const idx = Math.min(PALETTE_SIZE - 1, Math.floor(tt * (PALETTE_SIZE - 1)));
    return lutAt(lut, idx);
  };

const createCyclicSample =
  (lut: Uint8Array) =>
  (index: number, cycleSize: number): RgbColor => {
    const safeCycle = Math.max(1, cycleSize);
    const idx = ((index % safeCycle) + safeCycle) % safeCycle;
    const t = safeCycle === 1 ? 0 : idx / (safeCycle - 1);
    return lutAt(lut, Math.floor(t * (PALETTE_SIZE - 1)));
  };

const tint = (color: RgbColor, factor: number): RgbColor => {
  const f = clamp01(factor);
  return {
    r: Math.round(color.r * f),
    g: Math.round(color.g * f),
    b: Math.round(color.b * f),
  };
};

export const buildPalette = (
  baseHue: number,
  mode: ColorHarmonyMode,
  rng: Rng,
): Palette => {
  const hues = harmonyHues(baseHue, mode);
  const lut = buildLut(hues, rng);
  return {
    size: PALETTE_SIZE,
    mode,
    baseHue,
    hues,
    lut,
    sample: createSample(lut),
    sampleCyclic: createCyclicSample(lut),
    tint,
  };
};
