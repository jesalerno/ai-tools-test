// Complex Function Phase Plot renderer (exp, sin, z^2 class)

import { buildPalette, mapColor } from '../palette.js';
import type { RenderOpts } from '../registry.js';

/** Compute phase angle of a complex number */
function phase(re: number, im: number): number {
  return Math.atan2(im, re);
}

/** Apply complex exp */
function complexExp(re: number, im: number): [number, number] {
  const mag = Math.exp(re);
  return [mag * Math.cos(im), mag * Math.sin(im)];
}

/** Apply complex sin */
function complexSin(re: number, im: number): [number, number] {
  return [
    Math.sin(re) * Math.cosh(im),
    Math.cos(re) * Math.sinh(im),
  ];
}

/** Apply z^2 */
function complexSquare(re: number, im: number): [number, number] {
  return [re * re - im * im, 2 * re * im];
}

type ComplexFn = (re: number, im: number) => [number, number];

/** Render complex phase plot */
export function renderPhasePlot(
  buf: Uint8ClampedArray,
  width: number,
  height: number,
  opts: RenderOpts,
): void {
  const { seed, zoom, harmony } = opts;
  const palette = buildPalette((seed * 47.6) % 360, harmony, 256);
  const minDim = width < height ? width : height;
  const scale = 4.0 / (zoom * minDim);
  const fns: ComplexFn[] = [complexExp, complexSin, complexSquare];
  const fn = fns[seed % fns.length];

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const re = (px - width / 2) * scale;
      const im = (py - height / 2) * scale;
      const [fr, fi] = fn(re, im);
      const ph = phase(fr, fi);
      const t = (ph + Math.PI) / (2 * Math.PI);
      const mag = Math.sqrt(fr * fr + fi * fi);
      // Isocurve brightness: oscillate on log-magnitude to create contour rings
      // Base is 0.65 so the image is never too dark; peaks hit 1.0
      const logMag = Math.log(mag + 1e-10);
      const brightness = 0.65 + 0.35 * Math.abs(Math.sin(logMag * Math.PI));
      const c = mapColor(t, palette);
      const idx = (py * width + px) * 4;
      buf[idx] = Math.min(255, Math.floor(c.r * brightness));
      buf[idx + 1] = Math.min(255, Math.floor(c.g * brightness));
      buf[idx + 2] = Math.min(255, Math.floor(c.b * brightness));
      buf[idx + 3] = 255;
    }
  }
}
