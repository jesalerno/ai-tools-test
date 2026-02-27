/**
 * Shared type definitions for Fractal Card Generator
 * These types ensure contract alignment between frontend and backend
 */

/**
 * Available fractal generation methods
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
  | 'complex-phase';

/**
 * Fractal method metadata for UI display
 */
export interface FractalMethodInfo {
  id: FractalMethod;
  name: string;
  description: string;
}

/**
 * Request to generate a fractal card
 */
export interface GenerateCardRequest {
  method: FractalMethod;
  seed?: number;
}

/**
 * Response containing generated card image
 */
export interface GenerateCardResponse {
  success: boolean;
  imageData?: string; // Base64-encoded JPEG
  method: FractalMethod;
  seed: number;
  error?: string;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  success: false;
  error: string;
  statusCode: number;
}

/**
 * Card specification constants
 */
export const CARD_SPECS = {
  WIDTH_INCHES: 2.5,
  HEIGHT_INCHES: 3.5,
  DPI: 300,
  BORDER_MM: 3,
  BORDER_RADIUS_PX: 8,
} as const;

/**
 * Calculated card dimensions in pixels
 */
export const CARD_DIMENSIONS = {
  WIDTH_PX: Math.floor(CARD_SPECS.WIDTH_INCHES * CARD_SPECS.DPI),
  HEIGHT_PX: Math.floor(CARD_SPECS.HEIGHT_INCHES * CARD_SPECS.DPI),
  BORDER_PX: Math.floor((CARD_SPECS.BORDER_MM / 25.4) * CARD_SPECS.DPI),
} as const;

/**
 * Available fractal methods with display information
 */
export const FRACTAL_METHODS: FractalMethodInfo[] = [
  {
    id: 'mandelbrot',
    name: 'Mandelbrot Set',
    description: 'Classic fractal iterating z = z² + c',
  },
  {
    id: 'julia',
    name: 'Julia Set',
    description: 'Beautiful fractal with fixed c parameter',
  },
  {
    id: 'burning-ship',
    name: 'Burning Ship',
    description: 'Fractal using absolute value iterations',
  },
  {
    id: 'newton',
    name: 'Newton Fractal',
    description: 'Newton\'s method on z³ - 1',
  },
  {
    id: 'lyapunov',
    name: 'Lyapunov Fractal',
    description: 'Chaos theory visualization',
  },
  {
    id: 'ifs',
    name: 'Iterated Function System',
    description: 'Barnsley Fern or Sierpiński Triangle',
  },
  {
    id: 'l-system',
    name: 'L-System Fractal',
    description: 'Dragon curve or Koch curve',
  },
  {
    id: 'strange-attractor',
    name: 'Strange Attractor',
    description: 'Lorenz, Clifford, or de Jong attractor',
  },
  {
    id: 'heightmap',
    name: 'Noise Heightmap',
    description: 'Perlin/Simplex noise-based patterns',
  },
  {
    id: 'flame',
    name: 'Flame Fractal',
    description: 'Probabilistic IFS with variations',
  },
  {
    id: 'complex-phase',
    name: 'Complex Function Phase',
    description: 'Complex function visualization',
  },
];
