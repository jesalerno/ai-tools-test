import { validateGenerateCard } from '../../src/application/validation/requestSchemas.js';

describe('validateGenerateCard', () => {
  it('accepts empty object (all fields optional)', () => {
    const r = validateGenerateCard({});
    expect(r.ok).toBe(true);
  });

  it('accepts a known method', () => {
    expect(validateGenerateCard({ method: 'MANDELBROT' }).ok).toBe(true);
  });

  it('rejects unknown method', () => {
    const r = validateGenerateCard({ method: 'BOGUS' });
    expect(r.ok).toBe(false);
  });

  it('rejects out-of-range iterations', () => {
    expect(validateGenerateCard({ iterations: 10 }).ok).toBe(false);
    expect(validateGenerateCard({ iterations: 50_000 }).ok).toBe(false);
  });

  it('rejects out-of-range zoom', () => {
    expect(validateGenerateCard({ zoom: 0.1 }).ok).toBe(false);
    expect(validateGenerateCard({ zoom: 99 }).ok).toBe(false);
  });

  it('rejects unknown top-level properties', () => {
    expect(validateGenerateCard({ unknown: 1 }).ok).toBe(false);
  });

  it('accepts a full valid payload', () => {
    const r = validateGenerateCard({
      method: 'JULIA',
      seed: 1234,
      iterations: 800,
      zoom: 2,
    });
    expect(r.ok).toBe(true);
    expect(r.value).toEqual({ method: 'JULIA', seed: 1234, iterations: 800, zoom: 2 });
  });
});
