import type {FractalMethod} from '../../shared/types';
import {
  COVERAGE_TARGET,
  MAX_ITERATIONS,
  MIN_ITERATIONS,
  SAFE_MAX_ITERATIONS,
} from '../models/cardSpec';
import type {Palette} from '../models/color';
import {getFractalGenerator} from '../fractals/registry';
import type {FractalResult} from '../fractals/types';

export interface RenderFractalInput {
  method: FractalMethod;
  width: number;
  height: number;
  seed: number;
  iterations: number;
  zoom: number;
  palette: Palette;
  assertWithinBudget: () => void;
}

export interface RenderFractalOutput extends FractalResult {
  iterationsUsed: number;
}

function clampIterations(iterations: number): number {
  const safeUpperBound = Math.min(MAX_ITERATIONS, SAFE_MAX_ITERATIONS);
  return Math.max(MIN_ITERATIONS, Math.min(safeUpperBound, Math.floor(iterations)));
}

function nextIterationValue(current: number): number {
  const increased = Math.floor(current * 1.2);
  return clampIterations(Math.min(MAX_ITERATIONS, increased));
}

export function renderFractalQuadrant(input: RenderFractalInput): RenderFractalOutput {
  const generator = getFractalGenerator(input.method);
  let currentIterations = clampIterations(input.iterations);
  let bestResult: FractalResult | undefined;
  let bestIterations = currentIterations;

  while (true) {
    const result = generator({
      method: input.method,
      width: input.width,
      height: input.height,
      iterations: currentIterations,
      zoom: input.zoom,
      seed: input.seed,
      palette: input.palette,
      assertWithinBudget: input.assertWithinBudget,
    });

    if (!bestResult || result.coverage > bestResult.coverage) {
      bestResult = result;
      bestIterations = currentIterations;
    }

    const reachedCoverage = result.coverage >= COVERAGE_TARGET;
    const reachedCeiling = currentIterations >= clampIterations(MAX_ITERATIONS);
    if (reachedCoverage || reachedCeiling) {
      break;
    }

    const nextIterations = nextIterationValue(currentIterations);
    if (nextIterations === currentIterations) {
      break;
    }

    currentIterations = nextIterations;
  }

  if (!bestResult) {
    throw new Error('Fractal generation failed to produce output.');
  }

  return {
    buffer: bestResult.buffer,
    coverage: bestResult.coverage,
    iterationsUsed: bestIterations,
  };
}
