// Lyapunov fractal renderer

import { buildPalette, mapColor } from '../palette.js';
import type { RenderOpts } from '../registry.js';

const MAX_ITER = 200;

/** Compute Lyapunov exponent for given a, b, sequence */
function computeLyapunov(a: number, b: number, seq: number[]): number {
  let x = 0.5;
  let lyap = 0;
  for (let n = 0; n < MAX_ITER; n++) {
    const r = seq[n % seq.length] === 0 ? a : b;
    x = r * x * (1 - x);
    const deriv = Math.abs(r * (1 - 2 * x));
    lyap += deriv > 0 ? Math.log(deriv) : -10;
  }
  return lyap / MAX_ITER;
}

/** Render Lyapunov fractal */
export function renderLyapunov(
  buf: Uint8ClampedArray,
  width: number,
  height: number,
  opts: RenderOpts,
): void {
  const { seed, zoom, harmony } = opts;
  const palette = buildPalette((seed * 59.7) % 360, harmony, MAX_ITER);
  // Use more varied sequences for richer patterns
  const SEQS = [[0,1],[1,0],[0,0,1],[0,1,1],[1,0,0,1]];
  const seq = SEQS[seed % SEQS.length];
  const aMin = 2.5, aMax = 4.0;
  const bMin = 2.5, bMax = 4.0;

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const a = aMin + (px / width) * (aMax - aMin) / zoom;
      const b = bMin + (py / height) * (bMax - bMin) / zoom;
      const lyap = computeLyapunov(a, b, seq);
      const idx = (py * width + px) * 4;
      if (lyap < 0) {
        // Chaotic (negative): map magnitude to full palette range
        const t = Math.min(1, Math.abs(lyap) / 2.5);
        const c = mapColor(t, palette);
        buf[idx] = c.r; buf[idx + 1] = c.g; buf[idx + 2] = c.b; buf[idx + 3] = 255;
      } else {
        // Stable (positive): dark tint instead of pure black for visual interest
        const t = Math.min(1, lyap / 2.5);
        const c = mapColor(t, palette);
        buf[idx] = Math.floor(c.r * 0.15);
        buf[idx + 1] = Math.floor(c.g * 0.15);
        buf[idx + 2] = Math.floor(c.b * 0.15);
        buf[idx + 3] = 255;
      }
    }
  }
}
