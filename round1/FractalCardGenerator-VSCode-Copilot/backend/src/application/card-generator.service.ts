/**
 * Card Generator Service (Application Layer)
 * Generates fractal playing cards with proper dimensions, borders, and symmetry
 */

import { CardSpec, FractalMethod, FractalParams, GenerateCardRequest } from '../shared/types';
import { FractalFactory } from '../domain/fractal-factory';
import { PatternData } from '../domain/fractal-generator';
import { CanvasRenderer } from '../infrastructure/canvas-renderer';

const CARD_SPEC: CardSpec = {
  widthInches: 2.5,
  heightInches: 3.5,
  dpi: 300,
  borderMm: 3,
  borderRadius: 8
};

export interface CardImageData {
  /** Base64-encoded JPEG data */
  imageData: string;
  /** MIME type */
  mimeType: string;
  /** Method used */
  method: FractalMethod;
  /** Seed used */
  seed: number;
  /** Generation timestamp */
  timestamp: string;
}

export class CardGeneratorService {
  private renderer: CanvasRenderer;

  constructor() {
    this.renderer = new CanvasRenderer();
  }
  /**
   * Generate a fractal card
   * @param request Card generation request
   * @returns Card image data
   */
  generateCard(request: GenerateCardRequest): CardImageData {
    const seed = request.seed ?? this.generateSeed();
    const method = request.method;

    // Validate method
    this.validateMethod(method);

    // Calculate dimensions
    const dimensions = this.calculateDimensions();

    // Generate fractal pattern for one quadrant
    const generator = FractalFactory.createGenerator(method);
    const params: FractalParams = {
      width: Math.floor(dimensions.quadrantWidth),
      height: Math.floor(dimensions.quadrantHeight),
      seed
    };

    const pattern = generator.generate(params);

    // Create 4-quadrant symmetric pattern
    const fullPattern = this.createSymmetricPattern(pattern, dimensions);

    // Convert to base64
    const imageData = this.patternToBase64(fullPattern);

    return {
      imageData,
      mimeType: 'image/jpeg',
      method,
      seed,
      timestamp: new Date().toISOString()
    };
  }

  private validateMethod(method: FractalMethod): void {
    const validMethods = FractalFactory.getAllMethods();
    if (!validMethods.includes(method)) {
      throw new Error(`Invalid fractal method: ${method}`);
    }
  }

  private generateSeed(): number {
    return Math.floor(Math.random() * 1000000);
  }

  private calculateDimensions() {
    const widthPx = Math.floor(CARD_SPEC.widthInches * CARD_SPEC.dpi);
    const heightPx = Math.floor(CARD_SPEC.heightInches * CARD_SPEC.dpi);
    const borderPx = Math.floor((CARD_SPEC.borderMm / 25.4) * CARD_SPEC.dpi);

    const contentWidth = widthPx - 2 * borderPx;
    const contentHeight = heightPx - 2 * borderPx;

    return {
      totalWidth: widthPx,
      totalHeight: heightPx,
      borderPx,
      contentWidth,
      contentHeight,
      quadrantWidth: contentWidth / 2,
      quadrantHeight: contentHeight / 2
    };
  }

  private createSymmetricPattern(quadrant: PatternData, dimensions: ReturnType<typeof this.calculateDimensions>): PatternData {
    const { contentWidth, contentHeight } = dimensions;
    const qw = quadrant.width;
    const qh = quadrant.height;

    const pixels: number[][][] = [];

    for (let y = 0; y < contentHeight; y++) {
      const row: number[][] = [];
      for (let x = 0; x < contentWidth; x++) {
        const qx = x < qw ? x : contentWidth - 1 - x;
        const qy = y < qh ? y : contentHeight - 1 - y;
        
        const sourceX = Math.min(qx, qw - 1);
        const sourceY = Math.min(qy, qh - 1);
        
        row.push([...quadrant.pixels[sourceY][sourceX]]);
      }
      pixels.push(row);
    }

    return {
      pixels,
      width: contentWidth,
      height: contentHeight
    };
  }

  private patternToBase64(pattern: PatternData): string {
    const dimensions = this.calculateDimensions();
    
    return this.renderer.renderToBase64(pattern, {
      totalWidth: dimensions.totalWidth,
      totalHeight: dimensions.totalHeight,
      borderPx: dimensions.borderPx,
      borderRadius: CARD_SPEC.borderRadius,
      quality: 0.95
    });
  }
}
