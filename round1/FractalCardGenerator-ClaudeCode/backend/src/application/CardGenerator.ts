/**
 * Application service for generating fractal cards
 */

import { FractalMethod, CARD_DIMENSIONS } from '../shared/types';
import { FractalGeneratorFactory } from '../domain/FractalGeneratorFactory';
import { Color } from '../domain/FractalGenerator';

export interface CardGeneratorParams {
  method: FractalMethod;
  seed: number;
}

export interface GeneratedCard {
  colors: Color[][];
  method: FractalMethod;
  seed: number;
}

export class CardGenerator {
  /**
   * Generate a fractal card with seamless 4-quadrant symmetry
   */
  generate(params: CardGeneratorParams): GeneratedCard {
    const { method, seed } = params;

    // Calculate quadrant dimensions (half of card dimensions)
    const quadrantWidth = Math.floor(CARD_DIMENSIONS.WIDTH_PX / 2);
    const quadrantHeight = Math.floor(CARD_DIMENSIONS.HEIGHT_PX / 2);

    // Generate fractal pattern for one quadrant
    const generator = FractalGeneratorFactory.create(method);
    const quadrant = generator.generate({
      width: quadrantWidth,
      height: quadrantHeight,
      seed
    });

    // Mirror to create seamless 4-quadrant pattern
    const fullCard = this.mirrorQuadrants(quadrant);

    return {
      colors: fullCard,
      method,
      seed
    };
  }

  /**
   * Mirror a single quadrant to create seamless 4-quadrant pattern
   * Quadrant arrangement:
   * [Q1-flipped-h-v] [Q1-flipped-v]
   * [Q1-flipped-h]   [Q1-original]
   */
  private mirrorQuadrants(quadrant: Color[][]): Color[][] {
    const qHeight = quadrant.length;
    const qWidth = quadrant[0].length;

    const fullHeight = qHeight * 2;
    const fullWidth = qWidth * 2;

    const fullCard: Color[][] = [];

    for (let y = 0; y < fullHeight; y++) {
      fullCard[y] = [];

      for (let x = 0; x < fullWidth; x++) {
        const color = this.getQuadrantColor(quadrant, x, y, qWidth, qHeight);
        fullCard[y][x] = color;
      }
    }

    return fullCard;
  }

  /**
   * Get color from appropriate quadrant position
   */
  private getQuadrantColor(quadrant: Color[][], x: number, y: number, qWidth: number, qHeight: number): Color {
    // Determine which quadrant we're in
    const isRightHalf = x >= qWidth;
    const isBottomHalf = y >= qHeight;

    let qx: number;
    let qy: number;

    if (isRightHalf && isBottomHalf) {
      // Bottom-right: original
      qx = x - qWidth;
      qy = y - qHeight;
    } else if (isRightHalf && !isBottomHalf) {
      // Top-right: flip vertical
      qx = x - qWidth;
      qy = qHeight - 1 - y;
    } else if (!isRightHalf && isBottomHalf) {
      // Bottom-left: flip horizontal
      qx = qWidth - 1 - x;
      qy = y - qHeight;
    } else {
      // Top-left: flip both
      qx = qWidth - 1 - x;
      qy = qHeight - 1 - y;
    }

    return quadrant[qy][qx];
  }

  /**
   * Generate random seed
   */
  static generateSeed(): number {
    return Math.floor(Math.random() * 1000000);
  }
}
