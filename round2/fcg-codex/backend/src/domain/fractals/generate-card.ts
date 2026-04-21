import { createCanvas, ImageData, type Canvas, type SKRSContext2D } from '@napi-rs/canvas';

import { COLOR_HARMONIES, FRACTAL_METHODS, type FractalMethod, type GenerateCardResponse } from '../../shared/types.js';
import { createPalette } from '../colors.js';
import { createSeed, SeededRandom } from '../random.js';
import { RENDERER_MAP, type RenderConfig } from './renderers.js';

const CARD_WIDTH = 750;
const CARD_HEIGHT = 1050;
const BORDER_PX = 35;
const RADIUS_PX = 12;
const QUADRANT_WIDTH = CARD_WIDTH / 2;
const QUADRANT_HEIGHT = CARD_HEIGHT / 2;
const COVERAGE_THRESHOLD = 0.8;

interface GenerationCore {
  method: FractalMethod;
  seed: number;
  harmony: (typeof COLOR_HARMONIES)[number];
  iterations: number;
  zoom: number;
  retries: number;
  rendered: Uint8ClampedArray<ArrayBufferLike>;
  warnings: { code: string; message: string }[];
}

interface RoundedRect {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
}

export interface GenerateOptions {
  method?: FractalMethod;
  seed?: number;
  iterations?: number;
  zoom?: number;
}

export function generateCard(options: GenerateOptions): GenerateCardResponse {
  const core = resolveCore(options);
  const start = Date.now();
  const imageDataUri = renderCardDataUri(core.rendered);

  return {
    imageDataUri,
    method: core.method,
    seed: core.seed,
    effectiveParameters: {
      iterations: core.iterations,
      zoom: core.zoom,
      harmony: core.harmony,
    },
    metadata: {
      durationMs: Date.now() - start,
      retries: core.retries,
      warnings: core.warnings,
    },
  };
}

function resolveCore(options: GenerateOptions): GenerationCore {
  const method = pickMethod(options.method);
  const seed = createSeed(options.seed);
  const random = new SeededRandom(seed);
  const harmony = random.pick(COLOR_HARMONIES);
  const palette = createPalette(random.nextInt(0, 359), harmony);
  const iterations = clamp(options.iterations ?? random.nextInt(500, 2000), 500, 2000);
  const zoom = clamp(options.zoom ?? (0.5 + (random.next() * 3.5)), 0.5, 4);

  return runCoverageRetries({ method, seed, palette, iterations, zoom, harmony });
}

function runCoverageRetries(input: {
  method: FractalMethod;
  seed: number;
  palette: ReturnType<typeof createPalette>;
  iterations: number;
  zoom: number;
  harmony: (typeof COLOR_HARMONIES)[number];
}): GenerationCore {
  let retries = 0;
  let coverage = 0;
  let rendered: Uint8ClampedArray<ArrayBufferLike> = new Uint8ClampedArray(QUADRANT_WIDTH * QUADRANT_HEIGHT * 4);

  while (retries < 3 && coverage < COVERAGE_THRESHOLD) {
    const output = renderAttempt(input, retries);
    rendered = output.rgba;
    coverage = output.coverage;
    retries += 1;
  }

  const warnings = coverage < COVERAGE_THRESHOLD ? [{
    code: 'LOW_COVERAGE_BEST_EFFORT',
    message: 'Coverage threshold was not reached after retries; best effort image returned.',
  }] : [];

  return {
    method: input.method,
    seed: input.seed,
    harmony: input.harmony,
    iterations: input.iterations,
    zoom: input.zoom,
    retries,
    rendered,
    warnings,
  };
}

function renderAttempt(input: {
  method: FractalMethod;
  seed: number;
  palette: ReturnType<typeof createPalette>;
  iterations: number;
  zoom: number;
}, retry: number) {
  const renderer = RENDERER_MAP[input.method];
  if (!renderer) throw new Error(`Unknown fractal method: ${input.method}`);

  const config: RenderConfig = {
    width: QUADRANT_WIDTH,
    height: QUADRANT_HEIGHT,
    iterations: clamp(input.iterations + retry * 220, 500, 2000),
    zoom: clamp(input.zoom + retry * 0.1, 0.5, 4),
    random: new SeededRandom(input.seed + retry + 1),
    palette: input.palette,
  };

  return renderer(config);
}

function renderCardDataUri(rendered: Uint8ClampedArray<ArrayBufferLike>): string {
  const canvas = createCanvas(CARD_WIDTH, CARD_HEIGHT) as Canvas;
  const ctx = canvas.getContext('2d');
  const qCanvas = createCanvas(QUADRANT_WIDTH, QUADRANT_HEIGHT) as Canvas;
  qCanvas.getContext('2d').putImageData(new ImageData(rendered, QUADRANT_WIDTH, QUADRANT_HEIGHT), 0, 0);

  drawMirrored(ctx, qCanvas);
  drawRoundedBorder(ctx);

  return `data:image/jpeg;base64,${canvas.toBuffer('image/jpeg', 0.95).toString('base64')}`;
}

function pickMethod(method?: FractalMethod): FractalMethod {
  if (method) return method;
  return FRACTAL_METHODS[Math.floor(Math.random() * FRACTAL_METHODS.length)] ?? 'MANDELBROT';
}

function drawMirrored(ctx: SKRSContext2D, qCanvas: Canvas): void {
  ctx.save();
  ctx.drawImage(qCanvas, 0, 0);

  ctx.save();
  ctx.scale(-1, 1);
  ctx.drawImage(qCanvas, -CARD_WIDTH, 0);
  ctx.restore();

  ctx.save();
  ctx.scale(1, -1);
  ctx.drawImage(qCanvas, 0, -CARD_HEIGHT);
  ctx.restore();

  ctx.save();
  ctx.scale(-1, -1);
  ctx.drawImage(qCanvas, -CARD_WIDTH, -CARD_HEIGHT);
  ctx.restore();

  ctx.restore();
}

function drawRoundedBorder(ctx: SKRSContext2D): void {
  ctx.fillStyle = '#ffffff';
  roundedRectPath(ctx, { x: 0, y: 0, width: CARD_WIDTH, height: CARD_HEIGHT, radius: RADIUS_PX });
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = BORDER_PX;
  roundedRectPath(ctx, {
    x: BORDER_PX / 2,
    y: BORDER_PX / 2,
    width: CARD_WIDTH - BORDER_PX,
    height: CARD_HEIGHT - BORDER_PX,
    radius: RADIUS_PX,
  });
  ctx.stroke();
}

function roundedRectPath(ctx: SKRSContext2D, rect: RoundedRect): void {
  ctx.beginPath();
  ctx.moveTo(rect.x + rect.radius, rect.y);
  ctx.arcTo(rect.x + rect.width, rect.y, rect.x + rect.width, rect.y + rect.height, rect.radius);
  ctx.arcTo(rect.x + rect.width, rect.y + rect.height, rect.x, rect.y + rect.height, rect.radius);
  ctx.arcTo(rect.x, rect.y + rect.height, rect.x, rect.y, rect.radius);
  ctx.arcTo(rect.x, rect.y, rect.x + rect.width, rect.y, rect.radius);
  ctx.closePath();
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
