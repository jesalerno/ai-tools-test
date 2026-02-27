/**
 * Shared type definitions for Fractal Card Generator
 * These types ensure contract alignment between frontend and backend
 * 
 * NOTE: This is a copy of /shared/types.ts
 * Backend cannot import from outside src/ with current tsconfig
 */

/**
 * Available fractal generation methods
 */
export enum FractalMethod {
  MANDELBROT = 'mandelbrot',
  JULIA = 'julia',
  BURNING_SHIP = 'burning_ship',
  NEWTON = 'newton',
  LYAPUNOV = 'lyapunov',
  IFS = 'ifs',
  L_SYSTEM = 'l_system',
  STRANGE_ATTRACTOR = 'strange_attractor',
  HEIGHTMAP = 'heightmap',
  FLAME = 'flame',
  COMPLEX_FUNCTION = 'complex_function'
}

/**
 * Card specifications for printing
 */
export interface CardSpec {
  /** Card width in inches */
  widthInches: number;
  /** Card height in inches */
  heightInches: number;
  /** Dots per inch (resolution) */
  dpi: number;
  /** Border width in mm */
  borderMm: number;
  /** Border corner radius in pixels */
  borderRadius: number;
}

/**
 * Request to generate a fractal card
 */
export interface GenerateCardRequest {
  /** Fractal method to use */
  method: FractalMethod;
  /** Optional random seed for reproducibility */
  seed?: number;
}

/**
 * Response from card generation
 */
export interface GenerateCardResponse {
  /** Base64-encoded JPEG image data */
  imageData: string;
  /** MIME type of the image */
  mimeType: string;
  /** Fractal method that was used */
  method: FractalMethod;
  /** Seed value used for generation */
  seed: number;
  /** Timestamp of generation */
  timestamp: string;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  /** Error message suitable for display */
  error: string;
  /** Optional error code for programmatic handling */
  code?: string;
}

/**
 * Fractal generation parameters (internal use)
 */
export interface FractalParams {
  /** Canvas width in pixels */
  width: number;
  /** Canvas height in pixels */
  height: number;
  /** Random seed for parameter generation */
  seed: number;
  /** Maximum iterations for escape-time fractals */
  maxIterations?: number;
}

/**
 * Fractal pattern coverage validation result
 */
export interface CoverageValidation {
  /** Percentage of non-zero pixels (0-100) */
  coverage: number;
  /** Whether coverage meets minimum threshold (80%) */
  isValid: boolean;
  /** Total pixels in pattern */
  totalPixels: number;
  /** Non-zero pixels in pattern */
  filledPixels: number;
}
