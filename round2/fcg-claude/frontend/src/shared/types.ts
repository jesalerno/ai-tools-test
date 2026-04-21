// Mirrored copy of `/shared/types.ts` — Vite does not permit imports from
// outside `src/` (FCG-SPECv3 §6.1, Challenge 2). Must stay shape-identical
// to the root `shared/types.ts` and `backend/src/shared/types.ts`.

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

export const FRACTAL_METHOD_LABELS: Readonly<Record<FractalMethod, string>> = {
  MANDELBROT: 'Mandelbrot Set',
  JULIA: 'Julia Sets',
  BURNING_SHIP: 'Burning Ship',
  NEWTON: 'Newton Fractals',
  LYAPUNOV: 'Lyapunov Fractals',
  IFS: 'Iterated Function Systems (IFS)',
  L_SYSTEM: 'L-System Fractals',
  STRANGE_ATTRACTOR: 'Strange Attractors',
  HEIGHTMAP: 'Escape-Time Heightmaps',
  FLAME: 'Flame Fractals',
  PHASE_PLOT: 'Complex Phase Plots',
};
