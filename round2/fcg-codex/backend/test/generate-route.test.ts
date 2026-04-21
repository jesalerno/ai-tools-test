import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../src/infrastructure/http/app.js';

describe('generate route', () => {
  const app = createApp({
    bodySizeLimitMb: 2,
    corsOrigins: ['http://localhost:3035'],
    rateLimitWindowMs: 60000,
    rateLimitMax: 60,
  });

  it('generates an image with explicit method', async () => {
    const response = await request(app)
      .post('/api/cards/generate')
      .send({ method: 'MANDELBROT', seed: 42 });

    expect(response.status).toBe(200);
    expect(response.body.method).toBe('MANDELBROT');
    expect(response.body.imageDataUri.startsWith('data:image/jpeg;base64,')).toBe(true);
  });

  it('returns validation error for invalid method', async () => {
    const response = await request(app)
      .post('/api/cards/generate')
      .send({ method: 'NOT_A_METHOD' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('VALIDATION_ERROR');
  });
});
