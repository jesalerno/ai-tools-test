/**
 * Integration tests for API routes
 * Mock tests - canvas is mocked to avoid native dependencies
 */

import request from 'supertest';
import express from 'express';
import routes from './routes';

// Mock canvas to avoid native dependencies in tests
jest.mock('canvas', () => ({
  createCanvas: jest.fn(() => ({
    getContext: jest.fn(() => ({
      fillStyle: '',
      fillRect: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      quadraticCurveTo: jest.fn(),
      closePath: jest.fn(),
      clip: jest.fn(),
      createImageData: jest.fn((width: number, height: number) => ({
        data: new Uint8ClampedArray(width * height * 4),
        width,
        height
      })),
      putImageData: jest.fn()
    })),
    toBuffer: jest.fn(() => Buffer.from('fake-image-data'))
  }))
}));

const app = express();
app.use(express.json());
app.use('/api', routes);

describe('API Routes', () => {
  describe('GET /api/methods', () => {
    it('should return list of fractal methods', async () => {
      const response = await request(app)
        .get('/api/methods')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.methods).toBeInstanceOf(Array);
      expect(response.body.methods.length).toBe(11);
    });
  });

  describe('POST /api/generate', () => {
    it('should generate card with valid request', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({ method: 'mandelbrot', seed: 12345 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.imageData).toBeDefined();
      expect(response.body.method).toBe('mandelbrot');
      expect(response.body.seed).toBe(12345);
    }, 30000);

    it('should generate card without seed', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({ method: 'julia' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.seed).toBeDefined();
    }, 30000);

    it('should reject invalid method', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({ method: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid method');
    });

    it('should reject missing method', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject invalid seed', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({ method: 'mandelbrot', seed: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/health', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
    });
  });
});
