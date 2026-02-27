import request from 'supertest';
import { Server } from '../Server';

// Mock CardGeneratorService
jest.mock('../../../application/CardGeneratorService', () => ({
  CardGeneratorService: jest.fn().mockImplementation(() => ({
    generateCard: jest.fn().mockResolvedValue({
      buffer: Buffer.from('mock-image'),
      mimeType: 'image/jpeg',
    }),
  })),
}));

describe('Server', () => {
  let server: Server;
  let app: any;

  beforeEach(() => {
    server = new Server();
    app = server.getApp();
  });

  describe('Mock tests - In-bound conditions', () => {
    it('should respond to health check', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });

    it('should return available methods', async () => {
      const response = await request(app).get('/api/methods');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should generate card with valid method', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({ method: 'mandelbrot' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('imageData');
      expect(response.body).toHaveProperty('method');
      expect(response.body.method).toBe('mandelbrot');
    });

    it('should generate card with seed', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({ method: 'julia', seed: 12345 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('seed', 12345);
    });
  });

  describe('Mock tests - Out-of-bound conditions', () => {
    it('should return 400 for missing method', async () => {
      const response = await request(app).post('/api/generate').send({});
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid method', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({ method: 'invalid-method' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send('invalid json')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
    });

    it('should handle empty body', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({});

      expect(response.status).toBe(400);
    });
  });
});
