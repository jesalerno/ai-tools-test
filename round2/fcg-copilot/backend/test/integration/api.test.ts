/**
 * Integration tests for the generate API route.
 * Uses mock canvas to avoid native module dependencies.
 */

import request from 'supertest';
import { createApp } from '../../src/infrastructure/app.js';
import { mockCanvasAdapter } from '../../src/infrastructure/canvas/adapter.js';
import type { AppConfig } from '../../src/infrastructure/config/env.js';
import type { GenerateResponse, ErrorResponse } from '../../src/shared/types.js';

const TEST_CONFIG: AppConfig = {
  port: 0,
  bodySizeLimitMb: 2,
  maxGenerationMs: 15000,
  maxCanvasMemoryBytes: 134217728,
  rateLimitWindowMs: 60000,
  rateLimitMax: 1000,
  nodeEnv: 'test',
  corsOrigins: ['http://localhost:3000'],
};

const app = createApp(TEST_CONFIG, mockCanvasAdapter);

describe('GET /api/health', () => {
  it('should return status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect((res.body as { status: string }).status).toBe('ok');
    expect((res.body as { timestamp: string }).timestamp).toBeDefined();
  });
});

describe('POST /api/cards/generate', () => {
  it('should generate a card with valid method', async () => {
    const res = await request(app)
      .post('/api/cards/generate')
      .send({ method: 'mandelbrot' });
    expect(res.status).toBe(200);
    const body = res.body as GenerateResponse;
    expect(body.image).toMatch(/^data:image\/jpeg;base64,/);
    expect(body.method).toBe('mandelbrot');
    expect(body.params).toBeDefined();
    expect(body.metadata.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('should select a random method when none provided (Surprise Me)', async () => {
    const res = await request(app)
      .post('/api/cards/generate')
      .send({ params: { seed: 42 } });
    expect(res.status).toBe(200);
    const body = res.body as GenerateResponse;
    expect(body.method).toBeTruthy();
  });

  it('should return same method for same seed', async () => {
    const res1 = await request(app)
      .post('/api/cards/generate')
      .send({ params: { seed: 1234 } });
    const res2 = await request(app)
      .post('/api/cards/generate')
      .send({ params: { seed: 1234 } });
    expect((res1.body as GenerateResponse).method).toBe((res2.body as GenerateResponse).method);
  });

  it('should return 400 for invalid method', async () => {
    const res = await request(app)
      .post('/api/cards/generate')
      .send({ method: 'invalidMethod' });
    expect(res.status).toBe(400);
    const body = res.body as ErrorResponse;
    expect(body.error).toBe('VALIDATION_ERROR');
    expect(body.details).toBeDefined();
  });

  it('should return 400 for iterations out of range', async () => {
    const res = await request(app)
      .post('/api/cards/generate')
      .send({ params: { iterations: 100 } });
    expect(res.status).toBe(400);
    const body = res.body as ErrorResponse;
    expect(body.error).toBe('VALIDATION_ERROR');
  });

  it('should return 400 for malformed JSON', async () => {
    const res = await request(app)
      .post('/api/cards/generate')
      .set('Content-Type', 'application/json')
      .send('{ invalid json }');
    expect(res.status).toBe(400);
  });

  it('should return 404 for unknown route', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
    const body = res.body as ErrorResponse;
    expect(body.error).toBe('NOT_FOUND');
  });

  it('should include correlation ID support', async () => {
    const res = await request(app)
      .post('/api/cards/generate')
      .set('X-Correlation-Id', 'test-cid-123')
      .send({ method: 'julia' });
    expect(res.status).toBe(200);
  });
});
