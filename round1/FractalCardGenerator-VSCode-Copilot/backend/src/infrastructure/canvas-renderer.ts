/**
 * Canvas Renderer (Infrastructure Layer)
 * Renders patterns to JPEG images using node-canvas
 */

import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import { PatternData } from '../domain/fractal-generator';

export interface RenderOptions {
  /** Total canvas width including border */
  totalWidth: number;
  /** Total canvas height including border */
  totalHeight: number;
  /** Border width in pixels */
  borderPx: number;
  /** Border corner radius in pixels */
  borderRadius: number;
  /** JPEG quality (0-1) */
  quality?: number;
}

export class CanvasRenderer {
  /**
   * Render pattern to base64-encoded JPEG
   * @param pattern Pattern data to render
   * @param options Rendering options
   * @returns Base64-encoded JPEG string
   */
  renderToBase64(pattern: PatternData, options: RenderOptions): string {
    const canvas = createCanvas(options.totalWidth, options.totalHeight);
    const ctx = canvas.getContext('2d');

    // Fill with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, options.totalWidth, options.totalHeight);

    // Create rounded rectangle path for content
    this.createRoundedRectPath(
      ctx,
      options.borderPx,
      options.borderPx,
      pattern.width,
      pattern.height,
      options.borderRadius
    );

    // Clip to rounded rectangle
    ctx.clip();

    // Draw pattern
    this.drawPattern(ctx, pattern, options.borderPx, options.borderPx);

    // Convert to JPEG base64
    const quality = options.quality ?? 0.95;
    const buffer = canvas.toBuffer('image/jpeg', { quality });
    return buffer.toString('base64');
  }

  private createRoundedRectPath(
    ctx: CanvasRenderingContext2D,
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
  }

  private drawPattern(
    ctx: CanvasRenderingContext2D,
    pattern: PatternData,
    offsetX: number,
    offsetY: number
  ): void {
    const imageData = ctx.createImageData(pattern.width, pattern.height);
    const data = imageData.data;

    for (let y = 0; y < pattern.height; y++) {
      for (let x = 0; x < pattern.width; x++) {
        const i = (y * pattern.width + x) * 4;
        const [r, g, b] = pattern.pixels[y][x];
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
        data[i + 3] = 255;
      }
    }

    ctx.putImageData(imageData, offsetX, offsetY);
  }
}
