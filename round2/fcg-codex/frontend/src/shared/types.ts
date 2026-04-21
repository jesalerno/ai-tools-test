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

export interface GenerateCardResponse {
  imageDataUri: string;
  method: FractalMethod;
  seed: number;
  effectiveParameters: {
    iterations: number;
    zoom: number;
    harmony: string;
  };
  metadata: {
    durationMs: number;
    retries: number;
    warnings: Array<{ code: string; message: string }>;
  };
}
