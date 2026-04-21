/**
 * Canonical shared API contract for the Fractal Card Generator.
 * Backend re-exports from this file; frontend copies into frontend/src/shared/types.ts.
 */

/** Enumeration of all supported fractal generation methods. */
export type FractalMethod =
  | 'mandelbrot'
  | 'julia'
  | 'burningShip'
  | 'newton'
  | 'lyapunov'
  | 'ifs'
  | 'lsystem'
  | 'strangeAttractor'
  | 'heightmap'
  | 'flame'
  | 'phasePlot';

/** All valid fractal method values as a constant array for validation. */
export const FRACTAL_METHODS: readonly FractalMethod[] = [
  'mandelbrot',
  'julia',
  'burningShip',
  'newton',
  'lyapunov',
  'ifs',
  'lsystem',
  'strangeAttractor',
  'heightmap',
  'flame',
  'phasePlot',
] as const;

/** Human-readable display labels for each fractal method. */
export const FRACTAL_METHOD_LABELS: Record<FractalMethod, string> = {
  mandelbrot: 'Mandelbrot Set',
  julia: 'Julia Sets',
  burningShip: 'Burning Ship Fractal',
  newton: 'Newton Fractals',
  lyapunov: 'Lyapunov Fractals',
  ifs: 'Iterated Function Systems (IFS)',
  lsystem: 'L-System Fractals',
  strangeAttractor: 'Strange Attractors',
  heightmap: 'Escape-Time Heightmaps',
  flame: 'Flame Fractals',
  phasePlot: 'Complex Function Phase Plots',
};

/** Color harmony modes for palette generation. */
export type ColorHarmonyMode =
  | 'PRIMARY'
  | 'SQUARE'
  | 'COMPLEMENTARY'
  | 'TRIAD'
  | 'ANALOGOUS'
  | 'TETRADIC';

/** Optional tuning parameters sent by the client. */
export interface GenerateRequestParams {
  /** Optional seed for deterministic generation. */
  seed?: number;
  /** Iteration count override (clamped to 500–2000). */
  iterations?: number;
  /** Zoom level override (clamped to 0.5–4.0). */
  zoom?: number;
}

/** Request body for POST /api/cards/generate. */
export interface GenerateRequest {
  /** Fractal method to use; omit for random "Surprise Me" mode. */
  method?: FractalMethod;
  /** Optional tuning parameters. */
  params?: GenerateRequestParams;
}

/** Effective generation parameters included in the response. */
export interface EffectiveParams {
  iterations: number;
  zoom: number;
  seed: number;
  colorMode: ColorHarmonyMode;
  baseHue: number;
}

/** Generation metadata included in the response. */
export interface GenerationMetadata {
  /** Wall-clock time in milliseconds. */
  durationMs: number;
  /** Number of retry attempts made to meet coverage threshold. */
  retries: number;
  /** Non-critical warnings (e.g., coverage below threshold after retries). */
  warnings: string[];
  /** Coverage fraction of the quadrant (0–1). */
  coverage: number;
}

/** Successful response from POST /api/cards/generate. */
export interface GenerateResponse {
  /** Base64-encoded JPEG data URI. */
  image: string;
  /** The fractal method actually used (important for Surprise Me mode). */
  method: FractalMethod;
  /** Effective parameters used for generation. */
  params: EffectiveParams;
  /** Generation diagnostics. */
  metadata: GenerationMetadata;
}

/** Error response shape for 4xx/5xx responses. */
export interface ErrorResponse {
  /** Stable machine-readable error code. */
  error: string;
  /** Human-readable, user-safe message. */
  message: string;
  /** Optional structured field-level details (for validation errors). */
  details?: Record<string, string>;
}

/** Health check response. */
export interface HealthResponse {
  status: 'ok';
  timestamp: string;
}
