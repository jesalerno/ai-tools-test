import { FractalFactory } from '../FractalFactory';
import { FractalMethod } from '../../../shared/types';

describe('FractalFactory', () => {
  describe('In-bound conditions', () => {
    it('should create Mandelbrot generator', () => {
      const generator = FractalFactory.create('mandelbrot');
      expect(generator).toBeDefined();
    });

    it('should create Julia generator', () => {
      const generator = FractalFactory.create('julia');
      expect(generator).toBeDefined();
    });

    it('should create Burning Ship generator', () => {
      const generator = FractalFactory.create('burning-ship');
      expect(generator).toBeDefined();
    });

    it('should create Newton generator', () => {
      const generator = FractalFactory.create('newton');
      expect(generator).toBeDefined();
    });

    it('should create Lyapunov generator', () => {
      const generator = FractalFactory.create('lyapunov');
      expect(generator).toBeDefined();
    });

    it('should create IFS generator', () => {
      const generator = FractalFactory.create('ifs');
      expect(generator).toBeDefined();
    });

    it('should create L-System generator', () => {
      const generator = FractalFactory.create('l-system');
      expect(generator).toBeDefined();
    });

    it('should create Strange Attractor generator', () => {
      const generator = FractalFactory.create('strange-attractor');
      expect(generator).toBeDefined();
    });

    it('should create Heightmap generator', () => {
      const generator = FractalFactory.create('heightmap');
      expect(generator).toBeDefined();
    });

    it('should create Flame generator', () => {
      const generator = FractalFactory.create('flame');
      expect(generator).toBeDefined();
    });

    it('should create Phase Plot generator', () => {
      const generator = FractalFactory.create('phase-plot');
      expect(generator).toBeDefined();
    });
  });

  describe('Out-of-bound conditions', () => {
    it('should throw error for unknown method', () => {
      expect(() => {
        FractalFactory.create('unknown-method' as FractalMethod);
      }).toThrow('Unknown fractal method: unknown-method');
    });
  });
});
