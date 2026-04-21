import { describe, expect, it } from 'vitest';

import { RENDERER_MAP } from '../src/domain/fractals/renderers.js';
import { createPalette } from '../src/domain/colors.js';
import { SeededRandom } from '../src/domain/random.js';
import { COLOR_HARMONIES, FRACTAL_METHODS } from '../src/shared/types.js';

describe('renderers', () => {
  it('renders all fractal methods with valid buffers', () => {
    const random = new SeededRandom(1234);
    const harmony = COLOR_HARMONIES[0];
    if (!harmony) {
      throw new Error('Missing harmony');
    }

    const palette = createPalette(120, harmony);

    for (const method of FRACTAL_METHODS) {
      const renderer = RENDERER_MAP[method];
      if (!renderer) {
        throw new Error(`Missing renderer for ${method}`);
      }

      const output = renderer({
        width: 64,
        height: 64,
        iterations: 500,
        zoom: 1.5,
        random,
        palette,
      });

      expect(output.rgba.length).toBe(64 * 64 * 4);
      expect(output.coverage).toBeGreaterThanOrEqual(0);
      expect(output.coverage).toBeLessThanOrEqual(1);
    }
  });
});
