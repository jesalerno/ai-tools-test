/**
 * Mandelbrot Generator Tests (Mock)
 */

import { MandelbrotGenerator } from '../domain/generators/mandelbrot';
import { FractalParams } from '../shared/types';

describe('MandelbrotGenerator (Mock Tests)', () => {
  let generator: MandelbrotGenerator;

  beforeEach(() => {
    generator = new MandelbrotGenerator();
  });

  describe('generate - in-bound tests', () => {
    it('should generate pattern with correct dimensions', () => {
      const params: FractalParams = {
        width: 100,
        height: 100,
        seed: 12345
      };

      const pattern = generator.generate(params);

      expect(pattern.width).toBe(100);
      expect(pattern.height).toBe(100);
      expect(pattern.pixels).toHaveLength(100);
      expect(pattern.pixels[0]).toHaveLength(100);
    });

    it('should generate non-empty pattern', () => {
      const params: FractalParams = {
        width: 50,
        height: 50,
        seed: 42
      };

      const pattern = generator.generate(params);

      let hasNonZero = false;
      for (let y = 0; y < pattern.height; y++) {
        for (let x = 0; x < pattern.width; x++) {
          const [r, g, b] = pattern.pixels[y][x];
          if (r > 0 || g > 0 || b > 0) {
            hasNonZero = true;
            break;
          }
        }
        if (hasNonZero) break;
      }

      expect(hasNonZero).toBe(true);
    });

    it('should generate different patterns for different seeds', () => {
      const params1: FractalParams = { width: 50, height: 50, seed: 1 };
      const params2: FractalParams = { width: 50, height: 50, seed: 100 };

      const pattern1 = generator.generate(params1);
      const pattern2 = generator.generate(params2);

      // Check multiple pixels to ensure at least some are different
      let foundDifference = false;
      for (let y = 10; y < 40 && !foundDifference; y += 10) {
        for (let x = 10; x < 40 && !foundDifference; x += 10) {
          const pixel1 = pattern1.pixels[y][x];
          const pixel2 = pattern2.pixels[y][x];
          if (pixel1[0] !== pixel2[0] || pixel1[1] !== pixel2[1] || pixel1[2] !== pixel2[2]) {
            foundDifference = true;
          }
        }
      }
      
      expect(foundDifference).toBe(true);
    });
  });

  describe('validateCoverage', () => {
    it('should validate coverage correctly', () => {
      const params: FractalParams = {
        width: 100,
        height: 100,
        seed: 12345
      };

      const pattern = generator.generate(params);
      const validation = generator.validateCoverage(pattern);

      expect(validation.totalPixels).toBe(10000);
      expect(validation.filledPixels).toBeGreaterThan(0);
      expect(validation.coverage).toBeGreaterThanOrEqual(0);
      expect(validation.coverage).toBeLessThanOrEqual(100);
      expect(typeof validation.isValid).toBe('boolean');
    });
  });
});
