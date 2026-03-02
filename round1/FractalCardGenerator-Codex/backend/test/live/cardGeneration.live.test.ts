import assert from 'node:assert/strict';
import test from 'node:test';

import {CardGenerationService} from '../../src/application/services/cardGenerationService';
import {CanvasCardRenderer} from '../../src/infrastructure/canvas/cardRenderer';

test.skip('CardGenerationService (live canvas): renders a real jpeg image', async () => {
  const service = new CardGenerationService(new CanvasCardRenderer());
  const response = await service.generate({
    method: 'phase-plot',
    seed: 1,
    iterations: 500,
    zoom: 1,
  });

  assert.ok(response.imageBase64.length > 1000);
  assert.equal(response.mimeType, 'image/jpeg');
});
