import { describe, it, expect } from 'vitest';
import {
  FRACTAL_METHODS,
  COLOR_HARMONY_MODES,
  FRACTAL_METHOD_LABELS,
} from '../shared/types';

describe('shared contract mirror', () => {
  it('exposes exactly 11 fractal methods (spec §4)', () => {
    expect(FRACTAL_METHODS.length).toBe(11);
  });

  it('includes all required method keys', () => {
    const expected = [
      'MANDELBROT',
      'JULIA',
      'BURNING_SHIP',
      'NEWTON',
      'LYAPUNOV',
      'IFS',
      'L_SYSTEM',
      'STRANGE_ATTRACTOR',
      'HEIGHTMAP',
      'FLAME',
      'PHASE_PLOT',
    ];
    for (const key of expected) {
      expect(FRACTAL_METHODS).toContain(key);
    }
  });

  it('exposes the 6 color harmony modes (spec §17.1)', () => {
    expect(COLOR_HARMONY_MODES.length).toBe(6);
    for (const mode of ['PRIMARY', 'SQUARE', 'COMPLEMENTARY', 'TRIAD', 'ANALOGOUS', 'TETRADIC']) {
      expect(COLOR_HARMONY_MODES).toContain(mode);
    }
  });

  it('provides a human label for every method', () => {
    for (const key of FRACTAL_METHODS) {
      expect(typeof FRACTAL_METHOD_LABELS[key]).toBe('string');
      expect(FRACTAL_METHOD_LABELS[key].length).toBeGreaterThan(0);
    }
  });
});
