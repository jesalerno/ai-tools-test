/**
 * Domain layer: Core fractal generation interface
 * Follows clean architecture - no dependencies on infrastructure
 */

export interface FractalGenerator {
  generate(
    width: number,
    height: number,
    options?: Record<string, unknown>
  ): number[][]; // Returns 2D array of pixel values (0-255 grayscale or RGB)
}

export interface FractalOptions {
  maxIterations?: number;
  escapeRadius?: number;
  seed?: number;
  [key: string]: unknown;
}
