// Orchestrates fractal generation: pick method/seed, build palette,
// render quadrant, retry on low coverage, mirror, encode JPEG.

import type {
  FractalMethod,
  GenerateCardRequest,
  GenerateCardResponse,
} from '../../shared/types.js';
import { createRng, randomSeed } from '../../domain/rng.js';
import { pickHarmony } from '../../domain/color/harmony.js';
import { buildPalette } from '../../domain/color/palette.js';
import { getRenderer, pickRandomMethod } from '../../domain/fractals/registry.js';
import {
  COVERAGE_THRESHOLD,
  DEFAULT_ITERATIONS,
  DEFAULT_ZOOM,
  MAX_COVERAGE_RETRIES,
  QUADRANT_HEIGHT,
  QUADRANT_WIDTH,
} from '../../domain/constants.js';
import { mirrorQuadrantToCard } from '../../domain/raster/quadrant.js';
import { computeCoverage } from '../../domain/raster/coverage.js';
import type { CanvasEncoder } from '../../infrastructure/canvas/encoder.js';
import { logger } from '../../infrastructure/logging/logger.js';

const BG = { r: 245, g: 242, b: 236 }; // bone-ivory background

export interface GenerateCardDeps {
  readonly encoder: CanvasEncoder;
  readonly correlationId: string;
  readonly abortSignal: AbortSignal;
}

const selectMethod = (requested: FractalMethod | undefined, rng: ReturnType<typeof createRng>): FractalMethod =>
  requested ?? pickRandomMethod(rng);

export const generateCard = async (
  input: GenerateCardRequest,
  deps: GenerateCardDeps,
): Promise<GenerateCardResponse> => {
  const start = Date.now();
  const seed = input.seed ?? randomSeed();
  const rng = createRng(seed);
  const method = selectMethod(input.method, rng);
  const harmony = pickHarmony(rng);
  const baseHue = rng() * 360;
  const palette = buildPalette(baseHue, harmony, rng);
  const renderer = getRenderer(method);
  const iterations = input.iterations ?? DEFAULT_ITERATIONS;
  const zoom = input.zoom ?? DEFAULT_ZOOM;
  const warnings: string[] = [];

  const { pixels, coverage, retries } = renderWithRetries(
    renderer,
    { width: QUADRANT_WIDTH, height: QUADRANT_HEIGHT, iterations, zoom, rng, palette, background: BG },
    warnings,
    deps.abortSignal,
  );

  const full = mirrorQuadrantToCard({ pixels, width: QUADRANT_WIDTH, height: QUADRANT_HEIGHT });
  const jpegBase64 = await deps.encoder.encodeCard(full.pixels, full.width, full.height);
  const duration = Date.now() - start;

  logger.info(
    { method, seed, iterations, zoom, duration, coverage, retries, correlationId: deps.correlationId },
    'Card generated',
  );

  return {
    image: `data:image/jpeg;base64,${jpegBase64}`,
    method,
    seed,
    iterations,
    zoom,
    harmony,
    baseHue: Math.round(baseHue * 100) / 100,
    metadata: {
      durationMs: duration,
      retries,
      coverage: Math.round(coverage * 10_000) / 10_000,
      warnings,
      correlationId: deps.correlationId,
    },
  };
};

interface RenderResult {
  readonly pixels: Uint8ClampedArray;
  readonly coverage: number;
  readonly retries: number;
}

const renderWithRetries = (
  renderer: ReturnType<typeof getRenderer>,
  baseCtx: Parameters<ReturnType<typeof getRenderer>['render']>[0],
  warnings: string[],
  abort: AbortSignal,
): RenderResult => {
  let ctx = baseCtx;
  let pixels = renderer.render(ctx);
  let coverage = computeCoverage(pixels, ctx.width, ctx.height, ctx.background);
  let retries = 0;
  while (coverage < COVERAGE_THRESHOLD && retries < MAX_COVERAGE_RETRIES) {
    if (abort.aborted) break;
    retries += 1;
    ctx = { ...ctx, iterations: Math.min(ctx.iterations * 2, 2000), zoom: ctx.zoom * 0.7 };
    pixels = renderer.render(ctx);
    coverage = computeCoverage(pixels, ctx.width, ctx.height, ctx.background);
  }
  if (coverage < COVERAGE_THRESHOLD) {
    warnings.push(`coverage_below_threshold: ${coverage.toFixed(3)} (target ${COVERAGE_THRESHOLD})`);
  }
  return { pixels, coverage, retries };
};
