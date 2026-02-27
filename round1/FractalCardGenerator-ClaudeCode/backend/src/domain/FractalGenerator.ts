/**
 * Domain interface for fractal generators
 * Each generator must produce a 2D array of color values
 */

import { FractalMethod } from '../shared/types';

/**
 * RGB color value
 */
export interface Color {
  r: number;
  g: number;
  b: number;
}

/**
 * Fractal generation parameters
 */
export interface FractalParams {
  width: number;
  height: number;
  seed: number;
}

/**
 * Fractal generator interface
 * All generators must implement this interface
 */
export interface FractalGenerator {
  /**
   * Generate fractal pattern as 2D color array
   * @param params Generation parameters
   * @returns 2D array of RGB colors [y][x]
   */
  generate(params: FractalParams): Color[][];

  /**
   * Get the fractal method type
   */
  getMethod(): FractalMethod;
}

/**
 * Base random number generator using seed
 */
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  /**
   * Generate next random number in range [0, 1)
   */
  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Generate random integer in range [min, max]
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Generate random float in range [min, max)
   */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }
}

/**
 * Utility function to create empty color array
 */
export function createColorArray(width: number, height: number): Color[][] {
  const arr: Color[][] = [];
  for (let y = 0; y < height; y++) {
    arr[y] = [];
    for (let x = 0; x < width; x++) {
      arr[y][x] = { r: 0, g: 0, b: 0 };
    }
  }
  return arr;
}

/**
 * Map value to RGB color using HSV
 */
export function valueToColor(value: number, seed: number): Color {
  const hue = (value * 360 + seed * 137.5) % 360;
  const saturation = 0.7 + (value * 0.3);
  const lightness = 0.3 + (value * 0.4);

  return hsvToRgb(hue, saturation, lightness);
}

/**
 * Convert HSV to RGB
 */
function hsvToRgb(h: number, s: number, v: number): Color {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;

  if (h < 60) {
    r = c; g = x; b = 0;
  } else if (h < 120) {
    r = x; g = c; b = 0;
  } else if (h < 180) {
    r = 0; g = c; b = x;
  } else if (h < 240) {
    r = 0; g = x; b = c;
  } else if (h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  return {
    r: Math.floor((r + m) * 255),
    g: Math.floor((g + m) * 255),
    b: Math.floor((b + m) * 255)
  };
}
