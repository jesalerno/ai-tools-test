import { FRACTAL_METHODS } from '../../src/shared/types.js';
import { getRenderer, pickRandomMethod, RENDERERS } from '../../src/domain/fractals/registry.js';
import { buildPalette } from '../../src/domain/color/palette.js';
import { createRng } from '../../src/domain/rng.js';
import type { RenderContext } from '../../src/domain/fractals/types.js';

const BG = { r: 245, g: 242, b: 236 };

const makeCtx = (seed: number, iterations = 200): RenderContext => {
  const rng = createRng(seed);
  const palette = buildPalette(120, 'TRIAD', rng);
  return {
    width: 80, // small size for test speed
    height: 100,
    iterations,
    zoom: 1.5,
    rng,
    palette,
    background: BG,
  };
};

const countColorStats = (buf: Uint8ClampedArray): { solidBlack: number; nonBg: number; uniqueColors: number } => {
  const seen = new Set<number>();
  let solidBlack = 0;
  let nonBg = 0;
  const total = buf.length / 4;
  for (let i = 0; i < total; i++) {
    const o = i * 4;
    const r = buf[o] ?? 0;
    const g = buf[o + 1] ?? 0;
    const b = buf[o + 2] ?? 0;
    if (r === 0 && g === 0 && b === 0) solidBlack++;
    if (Math.abs(r - BG.r) > 10 || Math.abs(g - BG.g) > 10 || Math.abs(b - BG.b) > 10) nonBg++;
    seen.add((r << 16) | (g << 8) | b);
  }
  return { solidBlack, nonBg, uniqueColors: seen.size };
};

describe('registry + all renderers', () => {
  it('registry exposes all 11 methods', () => {
    expect(Object.keys(RENDERERS).sort()).toEqual([...FRACTAL_METHODS].sort());
  });

  it('pickRandomMethod returns a known method', () => {
    const rng = createRng(5);
    expect(FRACTAL_METHODS).toContain(pickRandomMethod(rng));
  });

  it('getRenderer throws on unknown method', () => {
    // @ts-expect-error — testing defensive path
    expect(() => getRenderer('BOGUS')).toThrow();
  });

  for (const method of FRACTAL_METHODS) {
    describe(method, () => {
      const ctx = makeCtx(42, 150);
      let pixels: Uint8ClampedArray;
      beforeAll(() => {
        pixels = getRenderer(method).render(ctx);
      });

      it('produces a correctly sized RGBA buffer', () => {
        expect(pixels.length).toBe(ctx.width * ctx.height * 4);
      });

      it('has less than 5% solid-black pixels (§5.4)', () => {
        const { solidBlack } = countColorStats(pixels);
        const total = ctx.width * ctx.height;
        expect(solidBlack / total).toBeLessThan(0.05);
      });

      it('produces multiple distinct colors (not greyscale-only)', () => {
        const { uniqueColors } = countColorStats(pixels);
        expect(uniqueColors).toBeGreaterThan(5);
      });

      it('is deterministic per seed', () => {
        const again = getRenderer(method).render(makeCtx(42, 150));
        // For identical seed + params, output must match exactly.
        expect(again).toEqual(pixels);
      });
    });
  }

  it('different seeds produce measurably different palettes (spec §17 multi-seed)', () => {
    const outs = [1, 2, 3, 4, 5].map((s) => {
      const buf = getRenderer('MANDELBROT').render(makeCtx(s, 150));
      const colors = new Set<number>();
      for (let i = 0; i < buf.length; i += 4) {
        colors.add(((buf[i] ?? 0) << 16) | ((buf[i + 1] ?? 0) << 8) | (buf[i + 2] ?? 0));
      }
      return colors;
    });
    const sig = outs.map((s) => [...s].slice(0, 20).sort().join(','));
    const uniqueSig = new Set(sig);
    expect(uniqueSig.size).toBe(5);
  });
});
