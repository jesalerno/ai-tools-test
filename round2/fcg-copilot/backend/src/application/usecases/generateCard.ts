/**
 * Generate use case — orchestrates fractal generation with coverage retries,
 * parameter selection, and card assembly.
 */

import type {
  FractalMethod,
  GenerateRequest,
  GenerateResponse,
  ColorHarmonyMode,
  EffectiveParams,
} from '../../shared/types.js';
import { FRACTAL_METHODS } from '../../shared/types.js';
import { getGenerator } from '../../domain/fractals/registry.js';
import { buildCardFromQuadrant, QUAD_WIDTH, QUAD_HEIGHT, CARD_WIDTH, CARD_HEIGHT } from '../../domain/cardRenderer.js';
import type { RenderParams } from '../../domain/fractals/types.js';
import { createPrng } from '../../domain/fractals/types.js';

/** Minimum acceptable coverage fraction per spec §3.3. */
const MIN_COVERAGE = 0.8;
/** Maximum retry attempts before returning best-effort. */
const MAX_RETRIES = 3;
/** All valid color harmony modes. */
const COLOR_MODES: ColorHarmonyMode[] = [
  'PRIMARY', 'SQUARE', 'COMPLEMENTARY', 'TRIAD', 'ANALOGOUS', 'TETRADIC',
];

/** Pick a random element from an array. */
function pickRandom<T>(arr: readonly T[], prng: () => number): T {
  return arr[Math.floor(prng() * arr.length)] as T;
}

/** Clamp a number to [min, max]. */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Build render parameters from request and a seed-based PRNG. */
function buildRenderParams(
  request: GenerateRequest,
  method: FractalMethod,
  seed: number,
  attempt: number
): RenderParams {
  const prng = createPrng(seed + attempt * 1000);
  const colorMode = pickRandom(COLOR_MODES, prng);
  const baseHue = Math.floor(prng() * 360);

  // Scale iterations/zoom for retry attempts to improve coverage
  const zoomBase = request.params?.zoom ?? (0.5 + prng() * 3.5);
  const iterBase = request.params?.iterations ?? (500 + Math.floor(prng() * 1500));
  const zoom = clamp(zoomBase * (1 + attempt * 0.3), 0.5, 4.0);
  const iterations = clamp(iterBase + attempt * 200, 500, 2000);

  return {
    width: QUAD_WIDTH,
    height: QUAD_HEIGHT,
    iterations,
    zoom,
    seed: seed + attempt,
    baseHue,
    colorMode,
  };
}

/** Canvas adapter interface (injected dependency). */
export interface CanvasAdapter {
  renderToJpeg(
    pixelData: Uint8ClampedArray,
    width: number,
    height: number
  ): Promise<string>;
}

/** Return type for the retry loop. */
interface RetryLoopResult {
  best: { data: Uint8ClampedArray; coverage: number };
  effectiveParams: EffectiveParams | null;
  retries: number;
  warnings: string[];
}

/** Run coverage-based retry loop; returns best result seen. */
function runRetryLoop(
  request: GenerateRequest,
  method: FractalMethod,
  baseSeed: number,
  generator: { render: (p: RenderParams) => { data: Uint8ClampedArray; coverage: number } }
): RetryLoopResult {
  let best = { data: new Uint8ClampedArray(0), coverage: 0 };
  let effectiveParams: EffectiveParams | null = null;
  let retries = 0;
  const warnings: string[] = [];

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const rp = buildRenderParams(request, method, baseSeed, attempt);
    const result = generator.render(rp);
    if (attempt === 0 || result.coverage > best.coverage) {
      best = result;
      effectiveParams = { iterations: rp.iterations, zoom: rp.zoom, seed: baseSeed, colorMode: rp.colorMode, baseHue: rp.baseHue };
    }
    if (result.coverage >= MIN_COVERAGE) break;
    if (attempt < MAX_RETRIES - 1) retries++;
  }

  if (best.coverage < MIN_COVERAGE) {
    warnings.push(`Coverage ${(best.coverage * 100).toFixed(1)}% below ${MIN_COVERAGE * 100}% threshold after ${retries + 1} attempts`);
  }
  return { best, effectiveParams, retries, warnings };
}

/** Generate a fractal card image. */
export async function generateCard(
  request: GenerateRequest,
  canvas: CanvasAdapter
): Promise<GenerateResponse> {
  const baseSeed = request.params?.seed ?? Math.floor(Math.random() * 2147483647);
  const prng = createPrng(baseSeed);
  const method: FractalMethod = request.method ?? pickRandom(FRACTAL_METHODS, prng);
  const generator = getGenerator(method);

  const startTime = Date.now();
  const { best, effectiveParams, retries, warnings } =
    runRetryLoop(request, method, baseSeed, generator);

  const fullCardData = buildCardFromQuadrant(best.data, QUAD_WIDTH, QUAD_HEIGHT);
  const image = await canvas.renderToJpeg(fullCardData, CARD_WIDTH, CARD_HEIGHT);

  return {
    image,
    method,
    params: effectiveParams ?? { iterations: 1000, zoom: 1.0, seed: baseSeed, colorMode: 'PRIMARY', baseHue: 0 },
    metadata: { durationMs: Date.now() - startTime, retries, warnings, coverage: best.coverage },
  };
}
