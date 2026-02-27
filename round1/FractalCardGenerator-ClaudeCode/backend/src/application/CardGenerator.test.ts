/**
 * Unit tests for CardGenerator
 */

import { CardGenerator } from './CardGenerator';
import { CARD_DIMENSIONS } from '../shared/types';

describe('CardGenerator', () => {
  let cardGenerator: CardGenerator;

  beforeEach(() => {
    cardGenerator = new CardGenerator();
  });

  describe('In-bound tests', () => {
    it('should generate card with correct dimensions', () => {
      const result = cardGenerator.generate({
        method: 'mandelbrot',
        seed: 12345
      });

      expect(result.colors).toHaveLength(CARD_DIMENSIONS.HEIGHT_PX);
      expect(result.colors[0]).toHaveLength(CARD_DIMENSIONS.WIDTH_PX);
    });

    it('should use provided seed', () => {
      const result = cardGenerator.generate({
        method: 'julia',
        seed: 42
      });

      expect(result.seed).toBe(42);
    });

    it('should return correct method', () => {
      const result = cardGenerator.generate({
        method: 'burning-ship',
        seed: 100
      });

      expect(result.method).toBe('burning-ship');
    });

    it('should generate all fractal methods without error', () => {
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
      ] as const;

      methods.forEach(method => {
        expect(() => {
          cardGenerator.generate({ method, seed: 123 });
        }).not.toThrow();
      });
    });

    it('should create symmetric pattern', () => {
      const result = cardGenerator.generate({
        method: 'mandelbrot',
        seed: 999
      });

      const height = result.colors.length;
      const width = result.colors[0].length;

      // Check symmetry (top-left should mirror bottom-right)
      const topLeft = result.colors[0][0];
      const bottomRight = result.colors[height - 1][width - 1];

      expect(topLeft.r).toBe(bottomRight.r);
      expect(topLeft.g).toBe(bottomRight.g);
      expect(topLeft.b).toBe(bottomRight.b);
    });
  });

  describe('Out-of-bound tests', () => {
    it('should handle invalid method gracefully', () => {
      expect(() => {
        cardGenerator.generate({
          method: 'invalid-method' as any,
          seed: 123
        });
      }).toThrow();
    });

    it('should handle very large seed values', () => {
      const result = cardGenerator.generate({
        method: 'mandelbrot',
        seed: 999999999
      });

      expect(result.colors).toHaveLength(CARD_DIMENSIONS.HEIGHT_PX);
    });

    it('should handle zero seed', () => {
      const result = cardGenerator.generate({
        method: 'julia',
        seed: 0
      });

      expect(result.seed).toBe(0);
      expect(result.colors).toBeDefined();
    });
  });

  describe('Static methods', () => {
    it('should generate valid random seed', () => {
      const seed = CardGenerator.generateSeed();

      expect(typeof seed).toBe('number');
      expect(seed).toBeGreaterThanOrEqual(0);
      expect(seed).toBeLessThan(1000000);
      expect(Number.isInteger(seed)).toBe(true);
    });
  });
});
