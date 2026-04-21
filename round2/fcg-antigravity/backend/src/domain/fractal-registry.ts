import { renderEscapeTime } from './fractals/escape-time.js';
import { FractalMethod, HarmonyMode } from '../../../shared/types.js';

export function generateFractalQuadrant(method: FractalMethod, width: number, height: number, seed: number, harmony: HarmonyMode): Uint8ClampedArray {
  switch (method) {
    case FractalMethod.Mandelbrot: return renderEscapeTime({width, height, seed, harmony}, 'mandelbrot');
    case FractalMethod.Julia: return renderEscapeTime({width, height, seed, harmony}, 'julia');
    case FractalMethod.BurningShip: return renderEscapeTime({width, height, seed, harmony}, 'burningship');
    // others fallback to mandelbrot mapping for now while being implemented
    default: return renderEscapeTime({width, height, seed, harmony}, 'mandelbrot');
  }
}

export function mirrorToFullCard(quadrant: Uint8ClampedArray, qWidth: number, qHeight: number): Uint8ClampedArray {
  const fullWidth = qWidth * 2;
  const fullHeight = qHeight * 2;
  const full = new Uint8ClampedArray(fullWidth * fullHeight * 4);
  
  for (let y = 0; y < qHeight; y++) {
    for (let x = 0; x < qWidth; x++) {
      const qIdx = (y * qWidth + x) * 4;
      const r = quadrant[qIdx];
      const g = quadrant[qIdx+1];
      const b = quadrant[qIdx+2];
      const a = quadrant[qIdx+3];
      
      // Top-Left (original)
      let idxTL = (y * fullWidth + x) * 4;
      full[idxTL] = r!; full[idxTL+1] = g!; full[idxTL+2] = b!; full[idxTL+3] = a!;
      
      // Top-Right (mirror x)
      let idxTR = (y * fullWidth + (fullWidth - 1 - x)) * 4;
      full[idxTR] = r!; full[idxTR+1] = g!; full[idxTR+2] = b!; full[idxTR+3] = a!;
      
      // Bottom-Left (mirror y)
      let idxBL = ((fullHeight - 1 - y) * fullWidth + x) * 4;
      full[idxBL] = r!; full[idxBL+1] = g!; full[idxBL+2] = b!; full[idxBL+3] = a!;
      
      // Bottom-Right (mirror x and y)
      let idxBR = ((fullHeight - 1 - y) * fullWidth + (fullWidth - 1 - x)) * 4;
      full[idxBR] = r!; full[idxBR+1] = g!; full[idxBR+2] = b!; full[idxBR+3] = a!;
    }
  }
  return full;
}
