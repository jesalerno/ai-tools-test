import { generateCard } from '../../src/application/usecases/generateCard.js';
import type { CanvasEncoder } from '../../src/infrastructure/canvas/encoder.js';

const encoder: CanvasEncoder = {
  async encodeCard(buf, w, h) {
    expect(buf.length).toBe(w * h * 4);
    return 'MOCKBASE64';
  },
};

const deps = (id = 'test'): Parameters<typeof generateCard>[1] => ({
  encoder,
  correlationId: id,
  abortSignal: new AbortController().signal,
});

describe('generateCard use case', () => {
  it('generates with a fixed seed deterministically', async () => {
    const a = await generateCard({ method: 'MANDELBROT', seed: 7, iterations: 500 }, deps('a'));
    const b = await generateCard({ method: 'MANDELBROT', seed: 7, iterations: 500 }, deps('b'));
    expect(a.image).toBe(b.image);
    expect(a.method).toBe('MANDELBROT');
    expect(a.seed).toBe(7);
  });

  it('random mode returns a valid method + seed', async () => {
    const r = await generateCard({}, deps());
    expect(r.method).toBeDefined();
    expect(typeof r.seed).toBe('number');
    expect(r.image).toMatch(/^data:image\/jpeg;base64,/);
  });

  it('carries correlation ID through to metadata', async () => {
    const r = await generateCard({ method: 'JULIA', seed: 3 }, deps('zzz'));
    expect(r.metadata.correlationId).toBe('zzz');
  });

  it('reports coverage and duration in metadata', async () => {
    const r = await generateCard({ method: 'FLAME', seed: 5 }, deps());
    expect(r.metadata.coverage).toBeGreaterThanOrEqual(0);
    expect(r.metadata.coverage).toBeLessThanOrEqual(1);
    expect(r.metadata.durationMs).toBeGreaterThanOrEqual(0);
  });
});
