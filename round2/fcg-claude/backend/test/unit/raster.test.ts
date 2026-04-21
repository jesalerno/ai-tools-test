import { mirrorQuadrantToCard } from '../../src/domain/raster/quadrant.js';
import { computeCoverage } from '../../src/domain/raster/coverage.js';
import { findMaxDensity, logDensityNormalize } from '../../src/domain/raster/density.js';

describe('raster helpers', () => {
  it('mirrorQuadrantToCard doubles width/height and tiles mirrored copies', () => {
    const qw = 4;
    const qh = 3;
    const q = new Uint8ClampedArray(qw * qh * 4);
    // Paint quadrant(0,0) red and (qw-1, qh-1) blue.
    q[0] = 255; q[3] = 255;
    const lastIdx = ((qh - 1) * qw + (qw - 1)) * 4;
    q[lastIdx + 2] = 255; q[lastIdx + 3] = 255;
    const full = mirrorQuadrantToCard({ pixels: q, width: qw, height: qh });
    expect(full.width).toBe(qw * 2);
    expect(full.height).toBe(qh * 2);
    // Original (0,0) → card (qw, qh) is red.
    const centerIdx = (qh * full.width + qw) * 4;
    expect(full.pixels[centerIdx]).toBe(255);
  });

  it('computeCoverage returns 0 when all pixels equal background', () => {
    const bg = { r: 10, g: 20, b: 30 };
    const buf = new Uint8ClampedArray(4 * 4 * 4);
    for (let i = 0; i < 16; i++) {
      buf[i * 4] = bg.r; buf[i * 4 + 1] = bg.g; buf[i * 4 + 2] = bg.b; buf[i * 4 + 3] = 255;
    }
    expect(computeCoverage(buf, 4, 4, bg)).toBe(0);
  });

  it('computeCoverage returns 1 when no pixels are background', () => {
    const bg = { r: 10, g: 20, b: 30 };
    const buf = new Uint8ClampedArray(4 * 4 * 4);
    for (let i = 0; i < 16; i++) {
      buf[i * 4] = 200; buf[i * 4 + 1] = 100; buf[i * 4 + 2] = 50; buf[i * 4 + 3] = 255;
    }
    expect(computeCoverage(buf, 4, 4, bg)).toBe(1);
  });

  it('findMaxDensity uses explicit loop without spread (no RangeError on big arrays)', () => {
    const size = 200_000;
    const buf = new Uint32Array(size);
    buf[123] = 999;
    buf[size - 1] = 7;
    expect(findMaxDensity(buf)).toBe(999);
  });

  it('logDensityNormalize returns 0 when maxDensity is 0', () => {
    expect(logDensityNormalize(0, 0, 0.5)).toBe(0);
  });

  it('logDensityNormalize monotonically increases with density', () => {
    const a = logDensityNormalize(10, 1000, 0.42);
    const b = logDensityNormalize(100, 1000, 0.42);
    expect(b).toBeGreaterThan(a);
  });
});
