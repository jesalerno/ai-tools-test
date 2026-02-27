/**
 * API Routes Tests (Mock)
 */

import request from 'supertest';
import app from '../index';
import { FractalMethod } from '../shared/types';

describe('API Routes (Mock Tests)', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/methods', () => {
    it('should return list of fractal methods', async () => {
      const response = await request(app)
        .get('/api/methods')
        .expect(200);

      expect(response.body).toHaveProperty('methods');
      expect(Array.isArray(response.body.methods)).toBe(true);
      expect(response.body.methods.length).toBe(11);
    });
  });

  describe('POST /api/generate - in-bound tests', () => {
    it('should generate card with valid method', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({ method: FractalMethod.MANDELBROT })
        .expect(200);

      expect(response.body).toHaveProperty('imageData');
      expect(response.body).toHaveProperty('mimeType', 'image/jpeg');
      expect(response.body).toHaveProperty('method', FractalMethod.MANDELBROT);
      expect(response.body).toHaveProperty('seed');
      expect(response.body).toHaveProperty('timestamp');
    }, 120000); // 2 minute timeout for canvas rendering

    it('should generate card with specified seed', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({ method: FractalMethod.JULIA, seed: 12345 })
        .expect(200);

      expect(response.body.seed).toBe(12345);
    }, 30000);
  });

  describe('POST /api/generate - out-of-bound tests', () => {
    it('should reject missing method', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('method');
    });

    it('should reject invalid method', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({ method: 'invalid_method' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject invalid seed type', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({ method: FractalMethod.MANDELBROT, seed: 'not_a_number' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('seed');
    });

    it('should reject seed out of range', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({ method: FractalMethod.MANDELBROT, seed: 2000000 })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject malformed JSON', async () => {
      const response = await request(app)
        .post('/api/generate')
        .set('Content-Type', 'application/json')
        .send('{"invalid json}')
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('404 handling', () => {
    it('should return 404 for unknown routes', async () => {
      await request(app)
        .get('/api/unknown')
        .expect(404);
    });
  });
});
