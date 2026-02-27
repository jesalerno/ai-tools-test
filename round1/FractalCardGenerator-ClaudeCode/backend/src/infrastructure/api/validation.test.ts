/**
 * Unit tests for input validation
 */

import { validateGenerateCardRequest } from './validation';

describe('validateGenerateCardRequest', () => {
  describe('In-bound tests', () => {
    it('should validate correct request', () => {
      const result = validateGenerateCardRequest({
        method: 'mandelbrot',
        seed: 12345
      });

      expect(result.valid).toBe(true);
      expect(result.data).toEqual({
        method: 'mandelbrot',
        seed: 12345
      });
    });

    it('should accept request without seed', () => {
      const result = validateGenerateCardRequest({
        method: 'julia'
      });

      expect(result.valid).toBe(true);
      expect(result.data?.method).toBe('julia');
      expect(result.data?.seed).toBeUndefined();
    });

    it('should accept all valid fractal methods', () => {
      const methods = [
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
        'complex-phase'
      ];

      methods.forEach(method => {
        const result = validateGenerateCardRequest({ method });
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Out-of-bound tests', () => {
    it('should reject null body', () => {
      const result = validateGenerateCardRequest(null);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('JSON object');
    });

    it('should reject non-object body', () => {
      const result = validateGenerateCardRequest('string');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('JSON object');
    });

    it('should reject missing method', () => {
      const result = validateGenerateCardRequest({});

      expect(result.valid).toBe(false);
      expect(result.error).toContain('method');
    });

    it('should reject invalid method type', () => {
      const result = validateGenerateCardRequest({
        method: 123
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('method');
    });

    it('should reject unknown method', () => {
      const result = validateGenerateCardRequest({
        method: 'unknown-fractal'
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid method');
    });

    it('should reject non-numeric seed', () => {
      const result = validateGenerateCardRequest({
        method: 'mandelbrot',
        seed: 'not-a-number'
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('number');
    });

    it('should reject non-integer seed', () => {
      const result = validateGenerateCardRequest({
        method: 'mandelbrot',
        seed: 123.45
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('integer');
    });

    it('should reject negative seed', () => {
      const result = validateGenerateCardRequest({
        method: 'mandelbrot',
        seed: -1
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('between');
    });

    it('should reject seed exceeding maximum', () => {
      const result = validateGenerateCardRequest({
        method: 'mandelbrot',
        seed: 1000000001
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('between');
    });
  });
});
