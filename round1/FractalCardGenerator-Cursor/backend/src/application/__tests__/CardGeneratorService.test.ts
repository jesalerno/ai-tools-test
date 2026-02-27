import { CardGeneratorService } from '../CardGeneratorService';
import { FractalMethod } from '../../shared/types';

// Mock canvas module
jest.mock('canvas', () => ({
  createCanvas: jest.fn(() => ({
    getContext: jest.fn(() => ({
      fillStyle: '',
      fillRect: jest.fn(),
      createImageData: jest.fn(() => ({
        data: new Uint8ClampedArray(1000),
      })),
      putImageData: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      quadraticCurveTo: jest.fn(),
      closePath: jest.fn(),
      fill: jest.fn(),
    })),
    toBuffer: jest.fn(() => Buffer.from('mock-image-data')),
  })),
}));

describe('CardGeneratorService', () => {
  let service: CardGeneratorService;

  beforeEach(() => {
    service = new CardGeneratorService();
  });

  describe('Mock tests - In-bound conditions', () => {
    it('should generate card with valid method', async () => {
      const result = await service.generateCard({ method: 'mandelbrot' });
      expect(result).toBeDefined();
      expect(result.buffer).toBeDefined();
      expect(result.mimeType).toBe('image/jpeg');
    });

    it('should generate card with seed', async () => {
      const result = await service.generateCard({
        method: 'mandelbrot',
        seed: 12345,
      });
      expect(result).toBeDefined();
    });

    it('should generate card for all fractal methods', async () => {
      const methods: FractalMethod[] = [
        'mandelbrot',
        'julia',
        'burning-ship',
        'newton',
        'lyapunov',
        'ifs',
        'l-system',
        'strange-attractor',
        'heightmap',
        'flame',
        'phase-plot',
      ];

      for (const method of methods) {
        const result = await service.generateCard({ method });
        expect(result).toBeDefined();
        expect(result.buffer).toBeDefined();
      }
    });
  });

  describe('Mock tests - Out-of-bound conditions', () => {
    it('should handle undefined seed', async () => {
      const result = await service.generateCard({
        method: 'mandelbrot',
        seed: undefined,
      });
      expect(result).toBeDefined();
    });

    it('should handle negative seed', async () => {
      const result = await service.generateCard({
        method: 'mandelbrot',
        seed: -100,
      });
      expect(result).toBeDefined();
    });

    it('should handle very large seed', async () => {
      const result = await service.generateCard({
        method: 'mandelbrot',
        seed: Number.MAX_SAFE_INTEGER,
      });
      expect(result).toBeDefined();
    });
  });

  describe('Live tests - Integration', () => {
    // These tests would run against actual implementations
    // Skipped by default, run with --testNamePattern="Live tests"
    it.skip('should generate actual card image (live test)', async () => {
      const result = await service.generateCard({ method: 'mandelbrot' });
      expect(result.buffer.length).toBeGreaterThan(0);
      expect(result.buffer.toString('base64')).toBeTruthy();
    });

    it.skip('should generate different images for different seeds (live test)', async () => {
      const result1 = await service.generateCard({
        method: 'mandelbrot',
        seed: 1,
      });
      const result2 = await service.generateCard({
        method: 'mandelbrot',
        seed: 2,
      });
      expect(result1.buffer).not.toEqual(result2.buffer);
    });

    it.skip('should generate consistent images for same seed (live test)', async () => {
      const result1 = await service.generateCard({
        method: 'mandelbrot',
        seed: 100,
      });
      const result2 = await service.generateCard({
        method: 'mandelbrot',
        seed: 100,
      });
      expect(result1.buffer).toEqual(result2.buffer);
    });
  });
});
