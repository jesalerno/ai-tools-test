import { generatePalette } from '../canvas-utils.js';
import { HarmonyMode } from '../../../../shared/types.js';

export interface FractalContext {
  width: number;
  height: number;
  seed: number;
  harmony: HarmonyMode;
}

export function renderEscapeTime(ctx: FractalContext, type: 'mandelbrot' | 'julia' | 'burningship'): Uint8ClampedArray {
  const { width, height, seed, harmony } = ctx;
  const pixels = new Uint8ClampedArray(width * height * 4);
  const palette = generatePalette(seed, harmony, 1024);
  const MAX_ITER = 1000;
  
  let rng = seed;
  const rand = () => { rng = (rng * 16807) % 2147483647; return rng / 2147483647; };
  // Adaptive zoom
  const zoom = 0.5 + rand() * 3.5;
  const cx = -0.5 + (rand() - 0.5);
  const cy = (rand() - 0.5);
  const jc_re = (rand() - 0.5) * 1.5;
  const jc_im = (rand() - 0.5) * 1.5;
  
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      let x0 = (px / width - 0.5) * 4 / zoom + cx;
      let y0 = (py / height - 0.5) * 4 / zoom + cy;
      
      let x = x0;
      let y = y0;
      let iter = 0;
      
      if (type === 'julia') {
        x0 = jc_re;
        y0 = jc_im;
      }
      
      while (x * x + y * y <= 4 && iter < MAX_ITER) {
        let xtemp = x * x - y * y + x0;
        if (type === 'burningship') {
          xtemp = x * x - y * y + x0;
          y = Math.abs(2 * x * y) + y0;
          x = Math.abs(xtemp);
        } else {
          y = 2 * x * y + y0;
          x = xtemp;
        }
        iter++;
      }
      
      let color: [number, number, number];
      if (iter === MAX_ITER) {
        color = palette[0] as [number, number, number]; 
      } else {
        // Spec 5.3: log-mapped palette indexing
        const t = Math.log(iter + 1) / Math.log(MAX_ITER + 1);
        const pIdx = Math.floor(t * (palette.length - 1));
        color = palette[pIdx] as [number, number, number];
      }
      
      const idx = (py * width + px) * 4;
      pixels[idx] = color[0];
      pixels[idx+1] = color[1];
      pixels[idx+2] = color[2];
      pixels[idx+3] = 255;
    }
  }
  return pixels;
}
