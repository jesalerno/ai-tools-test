/**
 * Unit tests for fractal generators.
 * Validates coverage, output dimensions, and color compliance.
 * All tests use mock canvas — no native dependencies required.
 */

import { MandelbrotGenerator } from '../../../src/domain/fractals/mandelbrot.js';
import { JuliaGenerator } from '../../../src/domain/fractals/julia.js';
import { BurningShipGenerator } from '../../../src/domain/fractals/burningShip.js';
import { NewtonGenerator } from '../../../src/domain/fractals/newton.js';
import { LyapunovGenerator } from '../../../src/domain/fractals/lyapunov.js';
import { IfsGenerator } from '../../../src/domain/fractals/ifs.js';
import { LSystemGenerator } from '../../../src/domain/fractals/lsystem.js';
import { StrangeAttractorGenerator } from '../../../src/domain/fractals/strangeAttractor.js';
import { HeightmapGenerator } from '../../../src/domain/fractals/heightmap.js';
import { FlameGenerator } from '../../../src/domain/fractals/flame.js';
import { PhasePlotGenerator } from '../../../src/domain/fractals/phasePlot.js';
import type { RenderParams } from '../../../src/domain/fractals/types.js';

/** Small test canvas to keep tests fast. */
const TEST_PARAMS: RenderParams = {
  width: 100,
  height: 140,
  iterations: 500,
  zoom: 1.0,
  seed: 42,
  baseHue: 120,
  colorMode: 'COMPLEMENTARY',
};

/** Verify no solid-black regions per spec §5.4. */
function hasNoSolidBlack(data: Uint8ClampedArray): boolean {
  let blackCount = 0;
  for (let i = 0; i < data.length; i += 4) {
    if ((data[i] ?? 0) === 0 && (data[i + 1] ?? 0) === 0 && (data[i + 2] ?? 0) === 0) {
      blackCount++;
    }
  }
  const total = data.length / 4;
  return blackCount / total < 0.3; // Less than 30% solid black is acceptable
}

/** Verify output has expected pixel count. */
function hasCorrectSize(data: Uint8ClampedArray, width: number, height: number): boolean {
  return data.length === width * height * 4;
}

const GENERATORS = [
  { name: 'Mandelbrot', gen: new MandelbrotGenerator() },
  { name: 'Julia', gen: new JuliaGenerator() },
  { name: 'BurningShip', gen: new BurningShipGenerator() },
  { name: 'Newton', gen: new NewtonGenerator() },
  { name: 'Lyapunov', gen: new LyapunovGenerator() },
  { name: 'IFS', gen: new IfsGenerator() },
  { name: 'LSystem', gen: new LSystemGenerator() },
  { name: 'StrangeAttractor', gen: new StrangeAttractorGenerator() },
  { name: 'Heightmap', gen: new HeightmapGenerator() },
  { name: 'Flame', gen: new FlameGenerator() },
  { name: 'PhasePlot', gen: new PhasePlotGenerator() },
];

describe('Fractal Generators', () => {
  for (const { name, gen } of GENERATORS) {
    describe(name, () => {
      it('should return correct pixel buffer size', () => {
        const result = gen.render(TEST_PARAMS);
        expect(hasCorrectSize(result.data, TEST_PARAMS.width, TEST_PARAMS.height)).toBe(true);
      });

      it('should return coverage in [0, 1]', () => {
        const result = gen.render(TEST_PARAMS);
        expect(result.coverage).toBeGreaterThanOrEqual(0);
        expect(result.coverage).toBeLessThanOrEqual(1);
      });

      it('should not produce solid black output (color compliance)', () => {
        const result = gen.render(TEST_PARAMS);
        expect(hasNoSolidBlack(result.data)).toBe(true);
      });

      it('should produce deterministic output for same seed', () => {
        const r1 = gen.render(TEST_PARAMS);
        const r2 = gen.render(TEST_PARAMS);
        // Check first 100 pixels match
        for (let i = 0; i < 400; i++) {
          expect(r1.data[i]).toBe(r2.data[i]);
        }
      });

      it('should produce different output for different seeds', () => {
        const r1 = gen.render({ ...TEST_PARAMS, seed: 1 });
        const r2 = gen.render({ ...TEST_PARAMS, seed: 99999 });
        const differs = Array.from(r1.data).some((v, i) => v !== r2.data[i]);
        expect(differs).toBe(true);
      });
    });
  }
});
