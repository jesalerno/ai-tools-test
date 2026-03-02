export const FRACTAL_METHODS = [
  "mandelbrot",
  "julia",
  "burning-ship",
  "newton",
  "lyapunov",
  "ifs",
  "l-system",
  "strange-attractor",
  "escape-heightmap",
  "flame",
  "phase-plot",
] as const;

export type FractalMethod = (typeof FRACTAL_METHODS)[number];

export interface FractalMethodOption {
  id: FractalMethod;
  label: string;
  description: string;
}

export const FRACTAL_METHOD_OPTIONS: ReadonlyArray<FractalMethodOption> = [
  { id: "mandelbrot", label: "Mandelbrot Set", description: "Escape-time fractal for z = z^2 + c." },
  { id: "julia", label: "Julia Sets", description: "Escape-time fractal with fixed complex parameter c." },
  { id: "burning-ship", label: "Burning Ship Fractal", description: "Absolute-value variant of quadratic iteration." },
  { id: "newton", label: "Newton Fractals", description: "Root convergence map for z^3 - 1." },
  { id: "lyapunov", label: "Lyapunov Fractals", description: "Stability map for alternating logistic map coefficients." },
  { id: "ifs", label: "Iterated Function Systems (IFS)", description: "Affine-transform density map with stochastic iteration." },
  { id: "l-system", label: "L-System Fractals", description: "Turtle-graphics path built from rewriting rules." },
  { id: "strange-attractor", label: "Strange Attractors", description: "Point-density visualization from chaotic attractors." },
  { id: "escape-heightmap", label: "Escape-Time Heightmaps", description: "Noise-driven height map rendered as a fractal field." },
  { id: "flame", label: "Flame Fractals", description: "Probabilistic IFS with non-linear variations." },
  { id: "phase-plot", label: "Complex Function Phase Plots", description: "Color map from complex function phase and magnitude." },
];

export interface GenerateCardRequest {
  method: FractalMethod;
  seed?: number;
  iterations?: number;
  zoom?: number;
}

export interface SurpriseCardRequest {
  seed?: number;
  iterations?: number;
  zoom?: number;
}

export interface CardImageResponse {
  method: FractalMethod;
  seed: number;
  iterations: number;
  zoom: number;
  coverage: number;
  widthPx: number;
  heightPx: number;
  dpi: number;
  borderPx: number;
  mimeType: "image/jpeg";
  imageBase64: string;
  imageDataUrl: string;
  generatedAt: string;
}

export interface MethodCatalogResponse {
  methods: ReadonlyArray<FractalMethodOption>;
}

export interface ApiErrorResponse {
  error: string;
  requestId?: string;
}
