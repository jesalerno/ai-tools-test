import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { FRACTAL_METHODS } from '../src/shared/types.js';
import { createApp } from '../src/infrastructure/http/app.js';

describe('random mode', () => {
  it('returns a method selected by server when method omitted', async () => {
    const app = createApp({
      bodySizeLimitMb: 2,
      corsOrigins: ['http://localhost:3035'],
      rateLimitWindowMs: 60000,
      rateLimitMax: 60,
    });

    const response = await request(app)
      .post('/api/cards/generate')
      .send({ seed: 101 });

    expect(response.status).toBe(200);
    expect(FRACTAL_METHODS.includes(response.body.method)).toBe(true);
  });
});
