import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../src/infrastructure/http/app.js';

describe('health route', () => {
  it('returns service health payload', async () => {
    const app = createApp({
      bodySizeLimitMb: 2,
      corsOrigins: ['http://localhost:3035'],
      rateLimitWindowMs: 60000,
      rateLimitMax: 60,
    });

    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
