import type {Palette, RgbColor} from '../models/color';
import type {Rng} from '../utils/random';

const HARMONIES = ['primary', 'square', 'complementary', 'triad', 'analogous', 'tetradic'] as const;

const clampChannel = (value: number): number => Math.max(0, Math.min(255, Math.round(value)));

function hslToRgb(h: number, s: number, l: number): RgbColor {
  const hue = ((h % 360) + 360) % 360;
  const sat = Math.max(0, Math.min(1, s));
  const lig = Math.max(0, Math.min(1, l));

  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lig - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (hue < 60) {
    r = c;
    g = x;
  } else if (hue < 120) {
    r = x;
    g = c;
  } else if (hue < 180) {
    g = c;
    b = x;
  } else if (hue < 240) {
    g = x;
    b = c;
  } else if (hue < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return {
    r: clampChannel((r + m) * 255),
    g: clampChannel((g + m) * 255),
    b: clampChannel((b + m) * 255),
  };
}

function buildHarmonyHues(baseHue: number, harmony: (typeof HARMONIES)[number]): number[] {
  switch (harmony) {
    case 'primary':
      return [baseHue, baseHue];
    case 'square':
      return [baseHue, baseHue + 90, baseHue + 180, baseHue + 270];
    case 'complementary':
      return [baseHue, baseHue + 180];
    case 'triad':
      return [baseHue, baseHue + 120, baseHue + 240];
    case 'analogous':
      return [baseHue - 30, baseHue, baseHue + 30, baseHue + 60];
    case 'tetradic':
      return [baseHue, baseHue + 60, baseHue + 180, baseHue + 240];
    default:
      return [baseHue];
  }
}

export function createPalette(rng: Rng): Palette {
  const baseHue = rng.int(0, 359);
  const harmony = rng.pick(HARMONIES);
  const hues = buildHarmonyHues(baseHue, harmony);
  const stops = hues.map((hue, index) => {
    const saturation = 0.55 + index * 0.08;
    const lightness = 0.32 + index * 0.1;
    return hslToRgb(hue, Math.min(0.9, saturation), Math.min(0.78, lightness));
  });

  return {
    harmony,
    background: hslToRgb(baseHue + 210, 0.35, 0.08),
    stops,
  };
}

export function samplePaletteColor(t: number, palette: Palette): RgbColor {
  if (palette.stops.length === 0) {
    return palette.background;
  }

  const normalized = Math.max(0, Math.min(1, t));
  if (palette.stops.length === 1) {
    return palette.stops[0];
  }

  const scaled = normalized * (palette.stops.length - 1);
  const index = Math.floor(scaled);
  const nextIndex = Math.min(palette.stops.length - 1, index + 1);
  const localT = scaled - index;
  const first = palette.stops[index];
  const second = palette.stops[nextIndex];

  return {
    r: clampChannel(first.r + (second.r - first.r) * localT),
    g: clampChannel(first.g + (second.g - first.g) * localT),
    b: clampChannel(first.b + (second.b - first.b) * localT),
  };
}
