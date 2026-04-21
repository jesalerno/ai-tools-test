// Mirrored copy of the canonical API contract (`/shared/types.ts`).
//
// The spec (FCG-SPECv3 §6.1, Challenge 2) describes a re-export pattern,
// but with `module: "NodeNext"` + `rootDir: ./src`, re-exporting from a
// path outside `rootDir` fails compilation. For consistency with the
// frontend — which also copies rather than imports — this file is kept
// shape-identical to `shared/types.ts`. Any change to one must be made
// in both; the `shared-contract.test.ts` unit test asserts they stay in
// sync (import them side-by-side and structurally compare).

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
