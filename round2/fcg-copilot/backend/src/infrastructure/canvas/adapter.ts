/**
 * Canvas adapter using @napi-rs/canvas for server-side rendering.
 * Validates memory budget before allocation per spec §8.1.
 */

import type { CanvasAdapter } from '../../application/usecases/generateCard.js';
import { logger } from '../config/logger.js';

/** Maximum canvas memory per spec §8.1 (default 128 MB). */
const MAX_CANVAS_MEMORY_BYTES =
  parseInt(process.env['MAX_CANVAS_MEMORY_BYTES'] ?? '134217728', 10);

/** Render pixel data to a JPEG data URI using @napi-rs/canvas. */
async function napiRenderToJpeg(
  pixelData: Uint8ClampedArray,
  width: number,
  height: number
): Promise<string> {
  const requiredBytes = width * height * 4;
  if (requiredBytes > MAX_CANVAS_MEMORY_BYTES) {
    throw new Error(
      `Canvas memory guard: required ${requiredBytes} bytes exceeds limit of ${MAX_CANVAS_MEMORY_BYTES} bytes`
    );
  }

  try {
    const napi = await import('@napi-rs/canvas');
    const { createCanvas, ImageData } = napi as unknown as {
      createCanvas: (w: number, h: number) => {
        getContext(type: '2d'): {
          putImageData(d: unknown, x: number, y: number): void;
        };
        toBuffer(type: string, opts: { quality: number }): Buffer;
      };
      ImageData: new (data: Uint8ClampedArray, w: number, h: number) => unknown;
    };
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const imageData = new ImageData(pixelData, width, height);
    ctx.putImageData(imageData, 0, 0);
    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.92 });
    const base64 = buffer.toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  } catch (err) {
    logger.error('Canvas render error', { error: String(err) });
    throw err;
  }
}

/** Production canvas adapter. */
export const napiCanvasAdapter: CanvasAdapter = {
  renderToJpeg: napiRenderToJpeg,
};

/** Mock canvas adapter for testing (avoids native module dependency). */
export const mockCanvasAdapter: CanvasAdapter = {
  renderToJpeg(_data, _width, _height) {
    return Promise.resolve('data:image/jpeg;base64,/9j/mock==');
  },
};
