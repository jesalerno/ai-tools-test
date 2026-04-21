export const FRACTAL_METHODS = [
  "MANDELBROT",
  "JULIA",
  "BURNING_SHIP",
  "NEWTON",
  "LYAPUNOV",
  "IFS",
  "L_SYSTEM",
  "STRANGE_ATTRACTOR",
  "HEIGHTMAP",
  "FLAME",
  "PHASE_PLOT"
] as const;

export type FractalMethod = (typeof FRACTAL_METHODS)[number];

export const HARMONY_MODES = [
  "PRIMARY",
  "SQUARE",
  "COMPLEMENTARY",
  "TRIAD",
  "ANALOGOUS",
  "TETRADIC"
] as const;

export type HarmonyMode = (typeof HARMONY_MODES)[number];

export interface GenerateCardRequest {
  method?: FractalMethod;
  seed?: string;
}

export interface GenerationMetadata {
  durationMs: number;
  retries: number;
  warnings: string[];
  coverage: number;
  harmonyMode: HarmonyMode;
}

export interface GenerateCardResponse {
  imageDataUri: string;
  selectedMethod: FractalMethod;
  seed: string;
  metadata: GenerationMetadata;
}
