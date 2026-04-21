import { createRng, rngInt, rngPick, rngRange, randomSeed } from '../../src/domain/rng.js';

describe('rng', () => {
  it('is deterministic for a given seed', () => {
    const a = createRng(42);
    const b = createRng(42);
    const samplesA = Array.from({ length: 10 }, () => a());
    const samplesB = Array.from({ length: 10 }, () => b());
    expect(samplesA).toEqual(samplesB);
  });

  it('produces distinct sequences for different seeds', () => {
    const a = createRng(1);
    const b = createRng(2);
    expect(a()).not.toEqual(b());
  });

  it('always returns values in [0, 1)', () => {
    const r = createRng(7);
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('rngInt respects bounds inclusive', () => {
    const r = createRng(100);
    for (let i = 0; i < 200; i++) {
      const v = rngInt(r, 5, 10);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThanOrEqual(10);
    }
  });

  it('rngRange respects min/max', () => {
    const r = createRng(200);
    for (let i = 0; i < 200; i++) {
      const v = rngRange(r, 0, 1);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it('rngPick selects from array', () => {
    const r = createRng(300);
    const items = ['a', 'b', 'c'] as const;
    for (let i = 0; i < 20; i++) {
      expect(items).toContain(rngPick(r, items));
    }
  });

  it('rngPick throws on empty', () => {
    const r = createRng(0);
    expect(() => rngPick(r, [])).toThrow();
  });

  it('randomSeed returns a positive integer', () => {
    const s = randomSeed();
    expect(Number.isInteger(s)).toBe(true);
    expect(s).toBeGreaterThanOrEqual(0);
  });
});
