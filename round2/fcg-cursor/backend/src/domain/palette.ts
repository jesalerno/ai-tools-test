import type { HarmonyMode } from "../shared/types.js";

const MODE_LIST: HarmonyMode[] = ["PRIMARY", "SQUARE", "COMPLEMENTARY", "TRIAD", "ANALOGOUS", "TETRADIC"];

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export const pickHarmonyMode = (seed: number): HarmonyMode => MODE_LIST[Math.abs(seed) % MODE_LIST.length];

const hslToRgb = (h: number, s: number, l: number): Rgb => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r1, g1, b1] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return { r: Math.round((r1 + m) * 255), g: Math.round((g1 + m) * 255), b: Math.round((b1 + m) * 255) };
};

const offsetsByMode: Record<HarmonyMode, number[]> = {
  PRIMARY: [0, 12, 24, 36, 48, 60],
  COMPLEMENTARY: [0, 30, 180, 210, 240, 270],
  ANALOGOUS: [0, 30, 60, 330, 300, 270],
  TRIAD: [0, 30, 120, 150, 240, 270],
  SQUARE: [0, 90, 180, 270, 45, 315],
  TETRADIC: [0, 30, 120, 150, 180, 210]
};

export const buildPalette = (baseHue: number, mode: HarmonyMode): Rgb[] => {
  const offsets = offsetsByMode[mode];
  const palette: Rgb[] = [];
  for (let i = 0; i < 256; i += 1) {
    const offset = offsets[i % offsets.length];
    const hue = (baseHue + offset + i / 4) % 360;
    palette.push(hslToRgb(hue, 0.72, 0.5));
  }
  return palette;
};

export const darkTint = (color: Rgb): Rgb => ({
  r: Math.max(1, Math.round(color.r * 0.2)),
  g: Math.max(1, Math.round(color.g * 0.2)),
  b: Math.max(1, Math.round(color.b * 0.2))
});
