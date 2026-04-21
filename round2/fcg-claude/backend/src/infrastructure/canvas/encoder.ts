// Canvas adapter: takes card pixel buffer (inner 680×980) and composes the
// final 750×1050 card with white border + rounded clip, then encodes JPEG.
// @napi-rs/canvas ships prebuilt binaries on common platforms; a mock
// replacement is used in tests (jest.config.cjs moduleNameMapper).

import { createCanvas } from '@napi-rs/canvas';
import type { SKRSContext2D } from '@napi-rs/canvas';
import {
  BORDER_PX,
  CARD_HEIGHT_PX,
  CARD_WIDTH_PX,
  CORNER_RADIUS_PX,
  INNER_HEIGHT,
  INNER_WIDTH,
  JPEG_QUALITY,
} from '../../domain/constants.js';

export interface CanvasEncoder {
  encodeCard(pixels: Uint8ClampedArray, width: number, height: number): Promise<string>;
}

interface RoundRect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly r: number;
}

const drawRoundRect = (ctx: SKRSContext2D, box: RoundRect): void => {
  const { x, y, w, h, r } = box;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

export const createCanvasEncoder = (): CanvasEncoder => ({
  encodeCard: async (pixels, width, height) => {
    if (width !== INNER_WIDTH || height !== INNER_HEIGHT) {
      throw new Error(`encoder: expected ${INNER_WIDTH}x${INNER_HEIGHT}, got ${width}x${height}`);
    }
    const canvas = createCanvas(CARD_WIDTH_PX, CARD_HEIGHT_PX);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CARD_WIDTH_PX, CARD_HEIGHT_PX);

    const inner = createCanvas(INNER_WIDTH, INNER_HEIGHT);
    const innerCtx = inner.getContext('2d');
    const imageData = innerCtx.createImageData(INNER_WIDTH, INNER_HEIGHT);
    imageData.data.set(pixels);
    innerCtx.putImageData(imageData, 0, 0);

    ctx.save();
    drawRoundRect(ctx, {
      x: BORDER_PX,
      y: BORDER_PX,
      w: INNER_WIDTH,
      h: INNER_HEIGHT,
      r: CORNER_RADIUS_PX,
    });
    ctx.clip();
    ctx.drawImage(inner, BORDER_PX, BORDER_PX);
    ctx.restore();

    const buffer = await canvas.encode('jpeg', JPEG_QUALITY);
    return Buffer.from(buffer).toString('base64');
  },
});
