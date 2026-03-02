import assert from 'node:assert/strict';
import test from 'node:test';

import {CardGenerationService} from '../../src/application/services/cardGenerationService';
import type {CardRendererPort} from '../../src/application/services/cardRendererPort';

class MockRenderer implements CardRendererPort {
  renderJpegBase64(): Promise<string> {
    return Promise.resolve('ZmFrZS1pbWFnZQ==');
  }
}

const service = new CardGenerationService(new MockRenderer());

test('CardGenerationService (mock): generates a card with selected method', async () => {
  const response = await service.generate({
    method: 'mandelbrot',
    seed: 42,
    iterations: 600,
    zoom: 1.1,
  });

  assert.equal(response.method, 'mandelbrot');
  assert.equal(response.seed, 42);
  assert.equal(response.imageBase64, 'ZmFrZS1pbWFnZQ==');
  assert.ok(response.coverage >= 0.8);
});

test('CardGenerationService (mock): selects a method for surprise requests', async () => {
  const response = await service.surprise({seed: 99});

  assert.ok(typeof response.method === 'string' && response.method.length > 0);
  assert.ok(response.iterations >= 500);
  assert.ok(response.iterations <= 1400);
});
