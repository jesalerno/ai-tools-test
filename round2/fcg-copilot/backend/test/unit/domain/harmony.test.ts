/**
 * Unit tests for domain/color/harmony.ts
 * Tests palette generation, log-mapping, and dark tint.
 */

import { buildPalette, logMapColor, darkTint, writePixel } from '../../../src/domain/color/harmony.js';
import type { RgbColor } from '../../../src/domain/color/harmony.js';

describe('buildPalette', () => {
  it('should build a palette with the default size of 256', () => {
    const palette = buildPalette(0, 'PRIMARY');
    expect(palette).toHaveLength(256);
  });

  it('should produce RGB values in [0, 255]', () => {
    const palette = buildPalette(120, 'COMPLEMENTARY');
    for (const color of palette) {
      expect(color.r).toBeGreaterThanOrEqual(0);
      expect(color.r).toBeLessThanOrEqual(255);
      expect(color.g).toBeGreaterThanOrEqual(0);
      expect(color.g).toBeLessThanOrEqual(255);
      expect(color.b).toBeGreaterThanOrEqual(0);
      expect(color.b).toBeLessThanOrEqual(255);
    }
  });

  it('should produce different palettes for different hues', () => {
    const p1 = buildPalette(0, 'PRIMARY');
    const p2 = buildPalette(180, 'PRIMARY');
    // At least one color should differ
    const differs = p1.some((c, i) => c.r !== p2[i]?.r || c.g !== p2[i]?.g || c.b !== p2[i]?.b);
    expect(differs).toBe(true);
  });

  it('should produce non-greyscale output for TRIAD mode', () => {
    const palette = buildPalette(30, 'TRIAD');
    const hasColor = palette.some((c) => Math.abs(c.r - c.g) > 10 || Math.abs(c.g - c.b) > 10);
    expect(hasColor).toBe(true);
  });
});

describe('logMapColor', () => {
  it('should return a palette color for t=0', () => {
    const palette = buildPalette(0, 'PRIMARY');
    const color = logMapColor(0, palette);
    expect(color).toBeDefined();
  });

  it('should return a palette color for t=1', () => {
    const palette = buildPalette(0, 'PRIMARY');
    const color = logMapColor(1, palette);
    expect(color).toBeDefined();
  });
});

describe('darkTint', () => {
  it('should dim a color', () => {
    const color: RgbColor = { r: 200, g: 150, b: 100 };
    const tinted = darkTint(color, 0.15);
    expect(tinted.r).toBeLessThan(color.r);
    expect(tinted.g).toBeLessThan(color.g);
    expect(tinted.b).toBeLessThan(color.b);
  });

  it('should not return solid black (minimum floor of 10)', () => {
    const color: RgbColor = { r: 255, g: 255, b: 255 };
    const tinted = darkTint(color, 0.01);
    expect(tinted.r).toBeGreaterThanOrEqual(10);
    expect(tinted.g).toBeGreaterThanOrEqual(10);
    expect(tinted.b).toBeGreaterThanOrEqual(10);
  });
});

describe('writePixel', () => {
  it('should write RGBA values at the given offset', () => {
    const data = new Uint8ClampedArray(8);
    writePixel(data, 0, { r: 100, g: 150, b: 200 });
    expect(data[0]).toBe(100);
    expect(data[1]).toBe(150);
    expect(data[2]).toBe(200);
    expect(data[3]).toBe(255);
  });
});
