import { test } from '@jest/globals';
import * as assert from 'assert';
import { generateFractalQuadrant } from './fractal-registry.js';
import { FractalMethod, HarmonyMode } from '../../../shared/types.js';

test('fractal registry logic computes quadrant array size correctly', () => {
    const quadrant = generateFractalQuadrant(FractalMethod.Mandelbrot, 10, 10, 1234, HarmonyMode.PRIMARY);
    assert.strictEqual(quadrant.length, 400); // 10*10*4
});
