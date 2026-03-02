import type {FractalContext} from './types';
import {samplePaletteColor} from '../services/paletteService';
import type {RgbColor} from '../models/color';
import {calculateCoverage, createBasePixelBuffer, type PixelBuffer} from '../utils/pixels';

export function createBufferWithBase(context: FractalContext): PixelBuffer {
  return createBasePixelBuffer(context.width, context.height, context.palette);
}

export function normalizePoint(x: number, y: number, context: FractalContext): {cx: number; cy: number} {
  const scale = 3.2 / context.zoom;
  const cx = (x / context.width - 0.5) * scale;
  const cy = (y / context.height - 0.5) * scale;
  return {cx, cy};
}

export function colorForIteration(
  iteration: number,
  maxIterations: number,
  context: FractalContext
): RgbColor {
  const t = maxIterations <= 0 ? 0 : iteration / maxIterations;
  return samplePaletteColor(t, context.palette);
}

export function finishCoverage(buffer: PixelBuffer): number {
  return calculateCoverage(buffer);
}
