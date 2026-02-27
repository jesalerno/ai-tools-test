import { MandelbrotGenerator } from '../MandelbrotGenerator';

describe('MandelbrotGenerator', () => {
  let generator: MandelbrotGenerator;

  beforeEach(() => {
    generator = new MandelbrotGenerator();
  });

  describe('In-bound conditions', () => {
    it('should generate a valid pattern with default options', () => {
      const result = generator.generate(100, 100);
      expect(result).toBeDefined();
      expect(result.length).toBe(100);
      expect(result[0].length).toBe(100);
      expect(result[0][0]).toBeGreaterThanOrEqual(0);
      expect(result[0][0]).toBeLessThanOrEqual(255);
    });

    it('should generate pattern with custom dimensions', () => {
      const result = generator.generate(50, 75);
      expect(result.length).toBe(75);
      expect(result[0].length).toBe(50);
    });

    it('should accept custom maxIterations', () => {
      const result = generator.generate(10, 10, { maxIterations: 50 });
      expect(result).toBeDefined();
      expect(result.length).toBe(10);
    });

    it('should accept custom zoom', () => {
      const result = generator.generate(10, 10, { zoom: 2.0 });
      expect(result).toBeDefined();
    });

    it('should accept custom center coordinates', () => {
      const result = generator.generate(10, 10, { centerX: 0, centerY: 0 });
      expect(result).toBeDefined();
    });
  });

  describe('Out-of-bound conditions', () => {
    it('should handle zero dimensions', () => {
      const result = generator.generate(0, 0);
      expect(result).toEqual([]);
    });

    it('should handle very large dimensions', () => {
      const result = generator.generate(1000, 1000);
      expect(result.length).toBe(1000);
      expect(result[0].length).toBe(1000);
    });

    it('should handle negative maxIterations gracefully', () => {
      const result = generator.generate(10, 10, { maxIterations: -10 });
      expect(result).toBeDefined();
    });

    it('should handle zero maxIterations', () => {
      const result = generator.generate(10, 10, { maxIterations: 0 });
      expect(result).toBeDefined();
    });

    it('should handle very large maxIterations', () => {
      const result = generator.generate(10, 10, { maxIterations: 10000 });
      expect(result).toBeDefined();
    });

    it('should handle zero zoom', () => {
      const result = generator.generate(10, 10, { zoom: 0 });
      expect(result).toBeDefined();
    });

    it('should handle negative zoom', () => {
      const result = generator.generate(10, 10, { zoom: -1 });
      expect(result).toBeDefined();
    });
  });
});
