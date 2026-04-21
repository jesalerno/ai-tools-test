/**
 * Canonical API contract for the Fractal Card Generator.
 *
 * This file is the single source of truth for request/response shapes that
 * cross the HTTP boundary. The backend re-exports from this file via
 * `backend/src/shared/types.ts`. The frontend keeps a mirrored copy at
 * `frontend/src/shared/types.ts` because Vite cannot import from outside its
 * `src/` root. Both copies must stay shape-identical.
 */

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

export const COLOR_HARMONY_MODES = [
  'PRIMARY',
  'SQUARE',
  'COMPLEMENTARY',
  'TRIAD',
  'ANALOGOUS',
  'TETRADIC',
] as const;

export type ColorHarmonyMode = (typeof COLOR_HARMONY_MODES)[number];

export interface GenerateCardRequest {
  readonly method?: FractalMethod;
  readonly seed?: number;
  readonly iterations?: number;
  readonly zoom?: number;
}

export interface GenerateCardMetadata {
  readonly durationMs: number;
  readonly retries: number;
  readonly coverage: number;
  readonly warnings: readonly string[];
  readonly correlationId: string;
}

export interface GenerateCardResponse {
  readonly image: string;
  readonly method: FractalMethod;
  readonly seed: number;
  readonly iterations: number;
  readonly zoom: number;
  readonly harmony: ColorHarmonyMode;
  readonly baseHue: number;
  readonly metadata: GenerateCardMetadata;
}

export interface ApiErrorResponse {
  readonly error: string;
  readonly message: string;
  readonly details?: Readonly<Record<string, unknown>>;
}

export interface HealthResponse {
  readonly status: 'ok';
  readonly uptimeSeconds: number;
  readonly version: string;
}
