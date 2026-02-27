/**
 * Infrastructure service for rendering cards to JPEG using Canvas
 */

import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import { Color } from '../domain/FractalGenerator';
import { CARD_DIMENSIONS } from '../shared/types';

const MM_TO_INCHES = 0.0393701;
const BORDER_PX = Math.floor((3 * MM_TO_INCHES) * 300);
const CORNER_RADIUS = 8;

export class CanvasRenderer {
  /**
   * Render color array to JPEG buffer
   */
  render(colors: Color[][]): Buffer {
    const width = CARD_DIMENSIONS.WIDTH_PX;
    const height = CARD_DIMENSIONS.HEIGHT_PX;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fill with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // Create clipping region for rounded corners
    this.createRoundedClip(ctx, BORDER_PX, BORDER_PX, width - 2 * BORDER_PX, height - 2 * BORDER_PX, CORNER_RADIUS);
    ctx.clip();

    // Draw fractal pattern within border
    this.drawPattern(ctx, colors, BORDER_PX, BORDER_PX, width - 2 * BORDER_PX, height - 2 * BORDER_PX);

    // Convert to JPEG buffer
    return canvas.toBuffer('image/jpeg', { quality: 0.95 });
  }

  /**
   * Create rounded rectangle clipping path
   */
  private createRoundedClip(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
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
  }

  /**
   * Draw fractal pattern to canvas
   */
  private drawPattern(ctx: CanvasRenderingContext2D, colors: Color[][], x: number, y: number, width: number, height: number): void {
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    const patternHeight = colors.length;
    const patternWidth = colors[0].length;

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        // Map canvas coordinates to pattern coordinates
        const patternY = Math.floor((py / height) * patternHeight);
        const patternX = Math.floor((px / width) * patternWidth);

        const color = colors[patternY][patternX];
        const index = (py * width + px) * 4;

        data[index] = color.r;
        data[index + 1] = color.g;
        data[index + 2] = color.b;
        data[index + 3] = 255;
      }
    }

    ctx.putImageData(imageData, x, y);
  }
}
