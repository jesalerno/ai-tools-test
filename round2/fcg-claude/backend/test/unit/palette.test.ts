import { buildPalette } from '../../src/domain/color/palette.js';
import { harmonyHues, pickHarmony } from '../../src/domain/color/harmony.js';
import { createRng } from '../../src/domain/rng.js';
import { COLOR_HARMONY_MODES } from '../../src/shared/types.js';

describe('harmony + palette', () => {
  it('each harmony mode resolves to ≥ 2 anchor hues', () => {
    for (const mode of COLOR_HARMONY_MODES) {
      const hs = harmonyHues(120, mode);
      expect(hs.length).toBeGreaterThanOrEqual(2);
      for (const h of hs) {
        expect(h).toBeGreaterThanOrEqual(0);
        expect(h).toBeLessThan(360);
      }
    }
  });

  it('pickHarmony returns a valid mode', () => {
    const rng = createRng(1);
    const mode = pickHarmony(rng);
    expect(COLOR_HARMONY_MODES).toContain(mode);
  });

  it('palette LUT has no solid-black pixels', () => {
    const rng = createRng(42);
    const palette = buildPalette(60, 'TRIAD', rng);
    let nonBlack = 0;
    for (let i = 0; i < palette.size; i++) {
      const c = palette.sample(i / (palette.size - 1));
      if (c.r + c.g + c.b > 30) nonBlack++;
    }
    // At least 99% of palette samples must be distinctly non-black.
    expect(nonBlack / palette.size).toBeGreaterThan(0.99);
  });

  it('palette tint darkens without going fully black', () => {
    const rng = createRng(1);
    const palette = buildPalette(200, 'COMPLEMENTARY', rng);
    const base = palette.sample(0.5);
    const tinted = palette.tint(base, 0.18);
    expect(tinted.r + tinted.g + tinted.b).toBeGreaterThan(0);
    expect(tinted.r).toBeLessThanOrEqual(base.r);
    expect(tinted.g).toBeLessThanOrEqual(base.g);
    expect(tinted.b).toBeLessThanOrEqual(base.b);
  });

  it('different seeds yield measurably different palettes', () => {
    const p1 = buildPalette(200, 'SQUARE', createRng(1));
    const p2 = buildPalette(200, 'SQUARE', createRng(2));
    let diff = 0;
    for (let i = 0; i < p1.size; i++) {
      const c1 = p1.sample(i / (p1.size - 1));
      const c2 = p2.sample(i / (p1.size - 1));
      diff += Math.abs(c1.r - c2.r) + Math.abs(c1.g - c2.g) + Math.abs(c1.b - c2.b);
    }
    expect(diff).toBeGreaterThan(0);
  });

  it('cyclic sampling wraps around', () => {
    const palette = buildPalette(0, 'PRIMARY', createRng(1));
    const a = palette.sampleCyclic(0, 256);
    const b = palette.sampleCyclic(256, 256);
    expect(a).toEqual(b);
  });
});
