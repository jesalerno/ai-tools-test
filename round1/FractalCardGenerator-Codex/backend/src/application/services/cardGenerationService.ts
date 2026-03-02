import type {CardImageResponse, FractalMethod, GenerateCardRequest, SurpriseCardRequest} from '../../shared/types';
import {FRACTAL_METHODS} from '../../shared/types';
import {
  BORDER_PX,
  CARD_DPI,
  CARD_HEIGHT_PX,
  CARD_WIDTH_PX,
  MAX_GENERATION_MS,
  MAX_ITERATIONS,
  MAX_ZOOM,
  MIN_ITERATIONS,
  MIN_ZOOM,
  QUADRANT_HEIGHT_PX,
  QUADRANT_WIDTH_PX,
  SAFE_MAX_ITERATIONS,
} from '../../domain/models/cardSpec';
import {createPalette} from '../../domain/services/paletteService';
import {renderFractalQuadrant} from '../../domain/services/fractalRenderService';
import {createSeededRng, makeSeed} from '../../domain/utils/random';
import {createTimeBudget, TimeBudgetExceededError} from '../../domain/utils/timeBudget';
import {TimeoutError} from '../errors/httpError';
import type {CardRendererPort} from './cardRendererPort';

function clampIterations(value: number): number {
  const safeMax = Math.min(MAX_ITERATIONS, SAFE_MAX_ITERATIONS);
  return Math.max(MIN_ITERATIONS, Math.min(safeMax, Math.floor(value)));
}

function clampZoom(value: number): number {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value));
}

function resolveIterations(requested: number | undefined, fallback: number): number {
  if (typeof requested === 'number') {
    return clampIterations(requested);
  }

  return clampIterations(fallback);
}

function resolveZoom(requested: number | undefined, fallback: number): number {
  if (typeof requested === 'number') {
    return clampZoom(requested);
  }

  return clampZoom(fallback);
}

function pickSurpriseMethod(seed: number): FractalMethod {
  const rng = createSeededRng(seed + 101);
  return rng.pick(FRACTAL_METHODS);
}

export class CardGenerationService {
  constructor(private readonly renderer: CardRendererPort) {}

  async generate(request: GenerateCardRequest): Promise<CardImageResponse> {
    return this.generateInternal(request.method, request.seed, request.iterations, request.zoom);
  }

  async surprise(request: SurpriseCardRequest): Promise<CardImageResponse> {
    const seed = makeSeed(request.seed);
    const method = pickSurpriseMethod(seed);
    return this.generateInternal(method, seed, request.iterations, request.zoom);
  }

  private async generateInternal(
    method: FractalMethod,
    explicitSeed: number | undefined,
    iterationsInput: number | undefined,
    zoomInput: number | undefined
  ): Promise<CardImageResponse> {
    const seed = makeSeed(explicitSeed);
    const rng = createSeededRng(seed);
    const iterations = resolveIterations(iterationsInput, rng.int(MIN_ITERATIONS, MIN_ITERATIONS + 350));
    const zoom = resolveZoom(zoomInput, MIN_ZOOM + rng.next() * (MAX_ZOOM - MIN_ZOOM));
    const palette = createPalette(rng);

    try {
      const timeBudget = createTimeBudget(MAX_GENERATION_MS);
      const rendered = renderFractalQuadrant({
        method,
        width: QUADRANT_WIDTH_PX,
        height: QUADRANT_HEIGHT_PX,
        seed,
        iterations,
        zoom,
        palette,
        assertWithinBudget: timeBudget.assertWithinBudget,
      });

      const imageBase64 = await this.renderer.renderJpegBase64({quadrant: rendered.buffer});

      return {
        method,
        seed,
        iterations: rendered.iterationsUsed,
        zoom,
        coverage: rendered.coverage,
        widthPx: CARD_WIDTH_PX,
        heightPx: CARD_HEIGHT_PX,
        dpi: CARD_DPI,
        borderPx: BORDER_PX,
        mimeType: 'image/jpeg',
        imageBase64,
        imageDataUrl: `data:image/jpeg;base64,${imageBase64}`,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof TimeBudgetExceededError) {
        throw new TimeoutError();
      }

      throw error;
    }
  }
}
