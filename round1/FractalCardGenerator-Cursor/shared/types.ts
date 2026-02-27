/**
 * Shared type definitions between frontend and backend
 * Ensures contract alignment between services
 */

export type FractalMethod =
  | 'mandelbrot'
  | 'julia'
  | 'burning-ship'
  | 'newton'
  | 'lyapunov'
  | 'ifs'
  | 'l-system'
  | 'strange-attractor'
  | 'heightmap'
  | 'flame'
  | 'phase-plot';

export interface FractalGenerationRequest {
  method: FractalMethod;
  seed?: number; // Optional seed for reproducibility
}

export interface FractalGenerationResponse {
  imageData: string; // Base64 encoded JPEG
  method: FractalMethod;
  seed?: number;
}

export interface FractalMethodOption {
  value: FractalMethod;
  label: string;
}

export const FRACTAL_METHODS: FractalMethodOption[] = [
  { value: 'mandelbrot', label: 'Mandelbrot Set' },
  { value: 'julia', label: 'Julia Sets' },
  { value: 'burning-ship', label: 'Burning Ship Fractal' },
  { value: 'newton', label: 'Newton Fractals' },
  { value: 'lyapunov', label: 'Lyapunov Fractals' },
  { value: 'ifs', label: 'Iterated Function Systems' },
  { value: 'l-system', label: 'L-System Fractals' },
  { value: 'strange-attractor', label: 'Strange Attractors' },
  { value: 'heightmap', label: 'Escape-Time Heightmaps' },
  { value: 'flame', label: 'Flame Fractals' },
  { value: 'phase-plot', label: 'Complex Function Phase Plots' },
];

// Card dimensions in pixels (at 300 DPI for print quality)
export const CARD_CONFIG = {
  WIDTH_MM: 63.5,
  HEIGHT_MM: 88.9,
  BORDER_MM: 3,
  DPI: 300,
  get WIDTH_PX() {
    return Math.round((this.WIDTH_MM / 25.4) * this.DPI);
  },
  get HEIGHT_PX() {
    return Math.round((this.HEIGHT_MM / 25.4) * this.DPI);
  },
  get BORDER_PX() {
    return Math.round((this.BORDER_MM / 25.4) * this.DPI);
  },
  get CONTENT_WIDTH_PX() {
    return this.WIDTH_PX - 2 * this.BORDER_PX;
  },
  get CONTENT_HEIGHT_PX() {
    return this.HEIGHT_PX - 2 * this.BORDER_PX;
  },
  CORNER_RADIUS: 8, // pixels for rounded corners
} as const;
