import assert from 'node:assert/strict';
import test from 'node:test';

import {FRACTAL_METHODS} from '../../../shared/types';
import {getFractalGenerator} from '../../src/domain/fractals/registry';
import {createPalette} from '../../src/domain/services/paletteService';
import {createSeededRng} from '../../src/domain/utils/random';

for (const method of FRACTAL_METHODS) {
  test(`domain fractal generators (mock): ${method} fills quadrant coverage target`, () => {
    const rng = createSeededRng(12345);
    const generator = getFractalGenerator(method);
    const result = generator({
      method,
      width: 120,
      height: 120,
      iterations: 550,
      zoom: 1,
      seed: 12345,
      palette: createPalette(rng),
      assertWithinBudget: () => undefined,
    });

    assert.equal(result.buffer.data.length, 120 * 120 * 4);
    assert.ok(result.coverage >= 0.8);
  });
}
