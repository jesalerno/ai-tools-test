import type {Palette, RgbColor} from '../models/color';
import {samplePaletteColor} from '../services/paletteService';

export interface PixelBuffer {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

export function createBasePixelBuffer(width: number, height: number, palette: Palette): PixelBuffer {
  const data = new Uint8ClampedArray(width * height * 4);
  const maxDistance = Math.hypot(width, height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const distance = Math.hypot(x, y) / maxDistance;
      const tint = samplePaletteColor(distance, palette);

      data[index] = Math.max(1, Math.floor((palette.background.r + tint.r) / 2));
      data[index + 1] = Math.max(1, Math.floor((palette.background.g + tint.g) / 2));
      data[index + 2] = Math.max(1, Math.floor((palette.background.b + tint.b) / 2));
      data[index + 3] = 255;
    }
  }

  return {width, height, data};
}

export function blendPixel(buffer: PixelBuffer, x: number, y: number, color: RgbColor, alpha: number): void {
  if (x < 0 || y < 0 || x >= buffer.width || y >= buffer.height) {
    return;
  }

  const a = Math.max(0, Math.min(1, alpha));
  const index = (y * buffer.width + x) * 4;
  const inv = 1 - a;

  buffer.data[index] = Math.round(buffer.data[index] * inv + color.r * a);
  buffer.data[index + 1] = Math.round(buffer.data[index + 1] * inv + color.g * a);
  buffer.data[index + 2] = Math.round(buffer.data[index + 2] * inv + color.b * a);
  buffer.data[index + 3] = 255;
}

export function paintDot(buffer: PixelBuffer, x: number, y: number, color: RgbColor, radius = 1): void {
  const startX = Math.floor(x - radius);
  const endX = Math.ceil(x + radius);
  const startY = Math.floor(y - radius);
  const endY = Math.ceil(y + radius);

  for (let yy = startY; yy <= endY; yy += 1) {
    for (let xx = startX; xx <= endX; xx += 1) {
      const distance = Math.hypot(xx - x, yy - y);
      if (distance > radius) {
        continue;
      }

      const alpha = Math.max(0.2, 1 - distance / Math.max(1, radius));
      blendPixel(buffer, xx, yy, color, alpha);
    }
  }
}

export function calculateCoverage(buffer: PixelBuffer): number {
  let active = 0;
  const total = buffer.width * buffer.height;

  for (let i = 0; i < buffer.data.length; i += 4) {
    const hasColor = buffer.data[i] > 0 || buffer.data[i + 1] > 0 || buffer.data[i + 2] > 0;
    if (hasColor) {
      active += 1;
    }
  }

  return total > 0 ? active / total : 0;
}
