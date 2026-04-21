/**
 * Complex Function Phase Plot fractal generator.
 * Maps f(z) argument and magnitude to color for exp, sin, or z².
 * Brightness floor >= 0.5 per spec §5.3.
 */

import { writePixel } from '../color/harmony.js';
import type { FractalGenerator, RenderParams, RenderResult } from './types.js';
import { computeCoverage, createPrng } from './types.js';

/** Convert HSL to RGB for phase-plot hue mapping. h in [0, 360], s/l in [0,1]. */
function hslToRgbSimple(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0; let g = 0; let b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

/** Compute exp(z) for complex z = (x + iy). Returns [re, im]. */
function complexExp(x: number, y: number): [number, number] {
  const magnitude = Math.exp(x);
  return [magnitude * Math.cos(y), magnitude * Math.sin(y)];
}

/** Compute sin(z) for complex z. Returns [re, im]. */
function complexSin(x: number, y: number): [number, number] {
  return [Math.sin(x) * Math.cosh(y), Math.cos(x) * Math.sinh(y)];
}

/** Compute z² for complex z. Returns [re, im]. */
function complexSquare(x: number, y: number): [number, number] {
  return [x * x - y * y, 2 * x * y];
}

type ComplexFn = (x: number, y: number) => [number, number];
const FUNCTIONS: ComplexFn[] = [complexExp, complexSin, complexSquare];

/** Render target for phase plot. */
interface RenderTarget { data: Uint8ClampedArray; width: number; height: number }

/** Render a phase plot with brightness floor >= 0.5 per spec §5.3. */
function renderPhasePlot(
  target: RenderTarget,
  fn: ComplexFn,
  zoom: number,
  baseHue: number
): void {
  const scale = 4.0 / zoom;

  for (let py = 0; py < target.height; py++) {
    for (let px = 0; px < target.width; px++) {
      const zx = (px / target.width - 0.5) * scale;
      const zy = (py / target.height - 0.5) * scale * (target.height / target.width);
      const [fx, fy] = fn(zx, zy);

      // Argument maps to hue, adjusted by base hue
      const arg = Math.atan2(fy, fx);
      const hue = (((arg / (2 * Math.PI)) * 360 + 360 + baseHue) % 360);

      // Magnitude maps to brightness; floor >= 0.5 per spec §5.3
      const magnitude = Math.sqrt(fx * fx + fy * fy);
      const BASE = 0.6;
      const AMPLITUDE = 0.35;
      // brightness = base + amplitude × |sin(π · log(magnitude))|
      const brightness = BASE + AMPLITUDE * Math.abs(Math.sin(Math.PI * Math.log(magnitude + 1)));

      const [r, g, b] = hslToRgbSimple(hue, 0.8, Math.min(brightness, 1.0));
      writePixel(target.data, (py * target.width + px) * 4, { r, g, b });
    }
  }
}

/** Complex Function Phase Plot generator. */
export class PhasePlotGenerator implements FractalGenerator {
  render(params: RenderParams): RenderResult {
    const { width, height, zoom, seed, baseHue } = params;
    const data = new Uint8ClampedArray(width * height * 4);

    const prng = createPrng(seed);
    const fnIdx = Math.floor(prng() * FUNCTIONS.length);
    const fn = FUNCTIONS[fnIdx] ?? complexExp;

    renderPhasePlot({ data, width, height }, fn, zoom, baseHue);

    return { data, coverage: computeCoverage(data, width, height) };
  }
}
