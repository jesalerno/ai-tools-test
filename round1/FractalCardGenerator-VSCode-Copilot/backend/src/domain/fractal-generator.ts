/**
 * Domain layer: Fractal generator interface
 * Defines the contract for all fractal generators
 */

import { FractalParams, CoverageValidation } from '../shared/types';

/**
 * Pattern data structure representing pixel colors
 */
export interface PatternData {
  /** 2D array of RGB values [height][width][3] */
  pixels: number[][][];
  /** Pattern width in pixels */
  width: number;
  /** Pattern height in pixels */
  height: number;
}

/**
 * Abstract base class for fractal generators
 */
export interface IFractalGenerator {
  /**
   * Generate a fractal pattern
   * @param params Generation parameters
   * @returns Pattern data with RGB values
   */
  generate(params: FractalParams): PatternData;

  /**
   * Validate pattern coverage
   * @param pattern Pattern to validate
   * @returns Coverage validation result
   */
  validateCoverage(pattern: PatternData): CoverageValidation;
}

/**
 * Utility class for color mapping
 */
export class ColorMapper {
  /**
   * Map iteration count to RGB color using smooth gradient
   * @param iterations Number of iterations before escape
   * @param maxIterations Maximum iterations allowed
   * @returns RGB color array [r, g, b]
   */
  static iterationsToColor(iterations: number, maxIterations: number): [number, number, number] {
    if (iterations >= maxIterations) {
      return [0, 0, 0]; // Inside set - black
    }

    // Smooth color mapping using continuous potential
    const normalized = iterations / maxIterations;
    const hue = normalized * 360;
    const saturation = 0.8;
    const lightness = 0.5;

    return this.hslToRgb(hue, saturation, lightness);
  }

  /**
   * Convert HSL to RGB
   * @param h Hue (0-360)
   * @param s Saturation (0-1)
   * @param l Lightness (0-1)
   * @returns RGB color array [r, g, b]
   */
  static hslToRgb(h: number, s: number, l: number): [number, number, number] {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;
    const hueSegment = Math.floor(h / 60);

    if (hueSegment === 0) { r = c; g = x; b = 0; }
    else if (hueSegment === 1) { r = x; g = c; b = 0; }
    else if (hueSegment === 2) { r = 0; g = c; b = x; }
    else if (hueSegment === 3) { r = 0; g = x; b = c; }
    else if (hueSegment === 4) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    ];
  }

  /**
   * Map phase angle to color
   * @param phase Phase angle in radians
   * @returns RGB color array [r, g, b]
   */
  static phaseToColor(phase: number): [number, number, number] {
    const hue = ((phase + Math.PI) / (2 * Math.PI)) * 360;
    return this.hslToRgb(hue, 0.8, 0.5);
  }
}

/**
 * Base validation for pattern coverage
 */
export function validatePatternCoverage(pattern: PatternData): CoverageValidation {
  const totalPixels = pattern.width * pattern.height;
  let filledPixels = 0;

  for (let y = 0; y < pattern.height; y++) {
    for (let x = 0; x < pattern.width; x++) {
      const [r, g, b] = pattern.pixels[y][x];
      if (r > 0 || g > 0 || b > 0) {
        filledPixels++;
      }
    }
  }

  const coverage = (filledPixels / totalPixels) * 100;
  const isValid = coverage >= 80;

  return {
    coverage,
    isValid,
    totalPixels,
    filledPixels
  };
}
