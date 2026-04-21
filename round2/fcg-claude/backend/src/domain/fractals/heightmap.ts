// Escape-time heightmap: value-noise heightmap with octave accumulation.
// Full-domain sampling without gaps (FCG-SPECv3 §5.2). Log-mapped output
// (§5.3 escape-time class).
import type { RenderContext, Renderer } from './types.js';
import { writeRgb } from './types.js';
import type { Rng } from '../rng.js';

const OCTAVES = 5;
const PERSISTENCE = 0.55;
const LACUNARITY = 2.05;
const GRID = 8;

interface NoiseField {
  readonly grid: Float32Array;
  readonly size: number;
}

const fade = (t: number): number => t * t * t * (t * (t * 6 - 15) + 10);

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const buildNoiseField = (rng: Rng, size: number): NoiseField => {
  const grid = new Float32Array(size * size);
  for (let i = 0; i < grid.length; i++) grid[i] = rng();
  return { grid, size };
};

const sample = (field: NoiseField, x: number, y: number): number => {
  const sz = field.size;
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = fade(xf);
  const v = fade(yf);
  const a = cellAt(field, xi, yi);
  const b = cellAt(field, xi + 1, yi);
  const c = cellAt(field, xi, yi + 1);
  const d = cellAt(field, xi + 1, yi + 1);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
};

const cellAt = (field: NoiseField, x: number, y: number): number => {
  const sz = field.size;
  const xi = ((x % sz) + sz) % sz;
  const yi = ((y % sz) + sz) % sz;
  return field.grid[yi * sz + xi] ?? 0;
};

const fbm = (field: NoiseField, x: number, y: number): number => {
  let freq = 1;
  let amp = 1;
  let acc = 0;
  let norm = 0;
  for (let i = 0; i < OCTAVES; i++) {
    acc += amp * sample(field, x * freq, y * freq);
    norm += amp;
    amp *= PERSISTENCE;
    freq *= LACUNARITY;
  }
  return acc / norm;
};

export const heightmap: Renderer = {
  id: 'HEIGHTMAP',
  render: (ctx: RenderContext): Uint8ClampedArray => {
    const { width, height, zoom, rng, palette } = ctx;
    const out = new Uint8ClampedArray(width * height * 4);
    const field = buildNoiseField(rng, GRID);
    const scale = 1.8 * zoom;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const nx = (x / width) * scale;
        const ny = (y / height) * scale;
        const h = fbm(field, nx, ny);
        const t = 0.1 + 0.9 * Math.pow(h, 0.7);
        writeRgb(out, y * width + x, palette.sample(t));
      }
    }
    return out;
  },
};
