export const FRACTAL_METHODS = [
  'MANDELBROT',
  'JULIA',
  'BURNING_SHIP',
  'NEWTON',
  'LYAPUNOV',
  'IFS',
  'L_SYSTEM',
  'STRANGE_ATTRACTOR',
  'HEIGHTMAP',
  'FLAME',
  'PHASE_PLOT',
] as const;

export type FractalMethod = (typeof FRACTAL_METHODS)[number];

export const COLOR_HARMONIES = [
  'PRIMARY',
  'SQUARE',
  'COMPLEMENTARY',
  'TRIAD',
  'ANALOGOUS',
  'TETRADIC',
] as const;

export type ColorHarmony = (typeof COLOR_HARMONIES)[number];

export interface GenerateCardRequest {
  method?: FractalMethod;
  seed?: number;
  iterations?: number;
  zoom?: number;
}

export interface GenerationWarning {
  code: string;
  message: string;
}

export interface EffectiveParameters {
  iterations: number;
  zoom: number;
  harmony: ColorHarmony;
}

export interface GenerationMetadata {
  durationMs: number;
  retries: number;
  warnings: GenerationWarning[];
}

export interface GenerateCardResponse {
  imageDataUri: string;
  method: FractalMethod;
  seed: number;
  effectiveParameters: EffectiveParameters;
  metadata: GenerationMetadata;
}

export interface ErrorResponse {
  error: string;
  message: string;
}
