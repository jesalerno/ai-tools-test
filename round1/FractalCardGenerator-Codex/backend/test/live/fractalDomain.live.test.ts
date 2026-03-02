import assert from 'node:assert/strict';
import test from 'node:test';

import {getFractalGenerator} from '../../src/domain/fractals/registry';
import {createPalette} from '../../src/domain/services/paletteService';
import {createSeededRng} from '../../src/domain/utils/random';

test.skip('domain fractals (live): renders high-detail mandelbrot', () => {
  const generator = getFractalGenerator('mandelbrot');
  const result = generator({
    method: 'mandelbrot',
    width: 320,
    height: 320,
    iterations: 1200,
    zoom: 2,
    seed: 77,
    palette: createPalette(createSeededRng(77)),
    assertWithinBudget: () => undefined,
  });

  assert.ok(result.coverage >= 0.8);
});
