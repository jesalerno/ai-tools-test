import request from 'supertest';
import { createApp } from '../../src/infrastructure/http/app.js';
import type { AppConfig } from '../../src/infrastructure/config/env.js';

const testConfig: AppConfig = {
  port: 0,
  nodeEnv: 'test',
  bodySizeLimitMb: 2,
  maxGenerationMs: 10_000,
  maxCanvasMemoryBytes: 134_217_728,
  rateLimitWindowMs: 60_000,
  rateLimitMax: 10_000,
  corsOrigins: ['http://localhost:3040'],
};

const makeApp = () => createApp(testConfig);

describe('HTTP API', () => {
  it('GET /api/health → 200 with status ok', async () => {
    const app = makeApp();
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.headers['cache-control']).toContain('no-store');
  });

  it('GET /api/openapi.json returns an OpenAPI doc', async () => {
    const res = await request(makeApp()).get('/api/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.3');
  });

  it('POST /api/cards/generate → 200 for valid request', async () => {
    const res = await request(makeApp())
      .post('/api/cards/generate')
      .set('Content-Type', 'application/json')
      .send({ method: 'MANDELBROT', seed: 42, iterations: 500 });
    expect(res.status).toBe(200);
    expect(res.body.image).toMatch(/^data:image\/jpeg;base64,/);
    expect(res.body.method).toBe('MANDELBROT');
    expect(res.body.seed).toBe(42);
    expect(res.body.metadata.correlationId).toBeDefined();
  }, 20_000);

  it('POST /api/cards/generate → 400 for invalid method', async () => {
    const res = await request(makeApp())
      .post('/api/cards/generate')
      .set('Content-Type', 'application/json')
      .send({ method: 'BOGUS' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('POST /api/cards/generate → 400 for out-of-range iterations', async () => {
    const res = await request(makeApp())
      .post('/api/cards/generate')
      .set('Content-Type', 'application/json')
      .send({ iterations: 50_000 });
    expect(res.status).toBe(400);
  });

  it('unknown route → 404 with stable error envelope', async () => {
    const res = await request(makeApp()).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('NOT_FOUND');
  });

  it('Surprise Me flow: omit method and dropdown can sync to returned method', async () => {
    const res = await request(makeApp())
      .post('/api/cards/generate')
      .set('Content-Type', 'application/json')
      .send({ seed: 12345 });
    expect(res.status).toBe(200);
    expect(typeof res.body.method).toBe('string');
    // Method returned must be one of the 11 spec methods.
    expect([
      'MANDELBROT', 'JULIA', 'BURNING_SHIP', 'NEWTON', 'LYAPUNOV',
      'IFS', 'L_SYSTEM', 'STRANGE_ATTRACTOR', 'HEIGHTMAP', 'FLAME', 'PHASE_PLOT',
    ]).toContain(res.body.method);
  }, 20_000);
});
