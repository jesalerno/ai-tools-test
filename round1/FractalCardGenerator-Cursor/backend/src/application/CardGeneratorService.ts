/**
 * Application layer: Use case for generating fractal cards
 * Orchestrates domain logic and infrastructure
 */

import { FractalFactory } from '../domain/fractal/FractalFactory';
import { FractalMethod, CARD_CONFIG } from '../shared/types';

export interface CardGenerationOptions {
  method: FractalMethod;
  seed?: number;
}

export interface CardImageData {
  buffer: Buffer;
  mimeType: string;
}

/**
 * Service for generating fractal card images
 * Handles seamless quadrant rendering and card formatting
 */
export class CardGeneratorService {
  /**
   * Generates a fractal card image with seamless quadrant pattern
   */
  async generateCard(options: CardGenerationOptions): Promise<CardImageData> {
    const { method, seed } = options;

    // Generate seed-based random parameters if seed provided
    if (seed !== undefined) {
      this.setSeed(seed);
    }

    // Generate pattern for one quadrant (will be mirrored)
    const quadrantWidth = Math.floor(CARD_CONFIG.CONTENT_WIDTH_PX / 2);
    const quadrantHeight = Math.floor(CARD_CONFIG.CONTENT_HEIGHT_PX / 2);

    const generator = FractalFactory.create(method);
    const quadrantPattern = generator.generate(quadrantWidth, quadrantHeight, {
      seed,
      zoom: this.getRandomZoom(method, seed),
      ...this.getMethodSpecificOptions(method, seed),
    });

    // Create seamless pattern by mirroring quadrants
    const fullPattern = this.createSeamlessPattern(quadrantPattern);

    // Render to image with border and rounded corners
    const imageBuffer = await this.renderCardImage(fullPattern);

    return {
      buffer: imageBuffer,
      mimeType: 'image/jpeg',
    };
  }

  /**
   * Creates seamless pattern by mirroring quadrant
   * Top-left -> Top-right (flip horizontal)
   * Top-left -> Bottom-left (flip vertical)
   * Top-left -> Bottom-right (flip both)
   */
  private createSeamlessPattern(quadrant: number[][]): number[][] {
    const qHeight = quadrant.length;
    const qWidth = quadrant[0].length;

    // Create full pattern
    const fullPattern: number[][] = [];

    // Top row: original + horizontal flip
    for (let y = 0; y < qHeight; y++) {
      const row: number[] = [];
      // Original quadrant
      row.push(...quadrant[y]);
      // Horizontal flip
      row.push(...quadrant[y].slice().reverse());
      fullPattern.push(row);
    }

    // Bottom row: vertical flip + both flips
    for (let y = 0; y < qHeight; y++) {
      const row: number[] = [];
      // Vertical flip
      row.push(...quadrant[qHeight - 1 - y]);
      // Both flips
      row.push(...quadrant[qHeight - 1 - y].slice().reverse());
      fullPattern.push(row);
    }

    return fullPattern;
  }

  /**
   * Renders card image with border and rounded corners
   */
  private async renderCardImage(pattern: number[][]): Promise<Buffer> {
    // Dynamic import to avoid loading canvas in tests
    const { createCanvas } = await import('canvas');

    const canvas = createCanvas(CARD_CONFIG.WIDTH_PX, CARD_CONFIG.HEIGHT_PX);
    const ctx = canvas.getContext('2d');

    // Fill white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, CARD_CONFIG.WIDTH_PX, CARD_CONFIG.HEIGHT_PX);

    // Draw rounded rectangle for border
    ctx.fillStyle = '#FFFFFF';
    this.drawRoundedRect(
      ctx,
      CARD_CONFIG.BORDER_PX / 2,
      CARD_CONFIG.BORDER_PX / 2,
      CARD_CONFIG.WIDTH_PX - CARD_CONFIG.BORDER_PX,
      CARD_CONFIG.HEIGHT_PX - CARD_CONFIG.BORDER_PX,
      CARD_CONFIG.CORNER_RADIUS
    );

    // Draw fractal pattern
    const imageData = ctx.createImageData(
      CARD_CONFIG.CONTENT_WIDTH_PX,
      CARD_CONFIG.CONTENT_HEIGHT_PX
    );

    const patternHeight = pattern.length;
    const patternWidth = pattern[0].length;

    for (let y = 0; y < CARD_CONFIG.CONTENT_HEIGHT_PX; y++) {
      for (let x = 0; x < CARD_CONFIG.CONTENT_WIDTH_PX; x++) {
        const patternY = y % patternHeight;
        const patternX = x % patternWidth;
        const gray = pattern[patternY][patternX];

        const index = (y * CARD_CONFIG.CONTENT_WIDTH_PX + x) * 4;
        imageData.data[index] = gray; // R
        imageData.data[index + 1] = gray; // G
        imageData.data[index + 2] = gray; // B
        imageData.data[index + 3] = 255; // A
      }
    }

    ctx.putImageData(
      imageData,
      CARD_CONFIG.BORDER_PX,
      CARD_CONFIG.BORDER_PX
    );

    // Convert to JPEG buffer
    return canvas.toBuffer('image/jpeg', { quality: 0.95 });
  }

  private drawRoundedRect(
    ctx: any, // CanvasRenderingContext2D - using any since canvas types may not be available
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  private getRandomZoom(method: FractalMethod, seed?: number): number {
    const rng = seed !== undefined ? this.seededRandom(seed) : Math.random;
    return 0.5 + rng() * 2.0; // Zoom between 0.5 and 2.5
  }

  private getMethodSpecificOptions(
    method: FractalMethod,
    seed?: number
  ): Record<string, unknown> {
    const rng = seed !== undefined ? this.seededRandom(seed) : Math.random;

    switch (method) {
      case 'julia':
        return {
          cReal: -0.8 + rng() * 0.4,
          cImag: -0.2 + rng() * 0.4,
        };
      case 'ifs':
        return {
          type: rng() > 0.5 ? 'fern' : 'sierpinski',
        };
      case 'l-system':
        return {
          type: rng() > 0.5 ? 'dragon' : 'koch',
        };
      case 'strange-attractor':
        return {
          type: ['lorenz', 'clifford', 'dejong'][Math.floor(rng() * 3)],
        };
      case 'phase-plot':
        return {
          functionType: ['exp', 'sin', 'square'][Math.floor(rng() * 3)],
        };
      default:
        return {};
    }
  }

  private setSeed(seed: number): void {
    // Simple seeded random number generator
    this.seed = seed;
  }

  private seed: number = 0;

  private seededRandom(seed: number): () => number {
    let value = seed;
    return () => {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  }
}
