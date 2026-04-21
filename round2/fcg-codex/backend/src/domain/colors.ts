import type { ColorHarmony } from '../shared/types.js';

interface RGB {
  r: number;
  g: number;
  b: number;
}

const MAX_CHANNEL = 255;
const MIN_CHANNEL = 8;

const HARMONY_OFFSETS: Record<ColorHarmony, number[]> = {
  PRIMARY: [0],
  SQUARE: [0, 90, 180, 270],
  COMPLEMENTARY: [0, 180],
  TRIAD: [0, 120, 240],
  ANALOGOUS: [0, 30, 330],
  TETRADIC: [0, 60, 180, 240],
};

export function createPalette(baseHue: number, harmony: ColorHarmony): RGB[] {
  const offsets = HARMONY_OFFSETS[harmony];
  const palette: RGB[] = [];

  for (let i = 0; i < 64; i += 1) {
    const offset = offsets[i % offsets.length] ?? 0;
    const hue = (baseHue + offset + i * 3) % 360;
    const sat = 0.55 + ((i % 7) * 0.05);
    const light = 0.35 + ((i % 5) * 0.08);
    palette.push(hslToRgb(hue, Math.min(0.95, sat), Math.min(0.85, light)));
  }

  return palette;
}

export function mapByIndex(palette: RGB[], t: number): RGB {
  const clamped = Math.max(0, Math.min(1, t));
  const index = Math.floor(clamped * (palette.length - 1));
  return palette[index] ?? palette[0] ?? { r: 32, g: 32, b: 32 };
}

function hslToRgb(h: number, s: number, l: number): RGB {
  const c = (1 - Math.abs((2 * l) - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const [r, g, b] = sectorChannels(hp, c, x);
  const m = l - c / 2;

  return {
    r: clampChannel((r + m) * MAX_CHANNEL),
    g: clampChannel((g + m) * MAX_CHANNEL),
    b: clampChannel((b + m) * MAX_CHANNEL),
  };
}

function sectorChannels(hp: number, c: number, x: number): [number, number, number] {
  if (hp < 1) return [c, x, 0];
  if (hp < 2) return [x, c, 0];
  if (hp < 3) return [0, c, x];
  if (hp < 4) return [0, x, c];
  if (hp < 5) return [x, 0, c];
  return [c, 0, x];
}

function clampChannel(value: number): number {
  return Math.min(MAX_CHANNEL, Math.max(MIN_CHANNEL, Math.round(value)));
}
