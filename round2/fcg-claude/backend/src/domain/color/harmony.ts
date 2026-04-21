// Color harmony modes (FCG-SPECv3 §17.1).
// Each harmony mode resolves a base hue into 4–6 anchor hues used to build
// a smoothly interpolated palette.

import type { ColorHarmonyMode } from '../../shared/types.js';
import type { Rng } from '../rng.js';

const DEG = 360;

export const harmonyHues = (baseHue: number, mode: ColorHarmonyMode): readonly number[] => {
  const h = ((baseHue % DEG) + DEG) % DEG;
  switch (mode) {
    case 'PRIMARY':
      return [h, (h + 30) % DEG, (h + 60) % DEG];
    case 'COMPLEMENTARY':
      return [h, (h + 180) % DEG];
    case 'ANALOGOUS':
      return [h, (h + 30) % DEG, (h + 60) % DEG, (h + DEG - 30) % DEG];
    case 'TRIAD':
      return [h, (h + 120) % DEG, (h + 240) % DEG];
    case 'SQUARE':
      return [h, (h + 90) % DEG, (h + 180) % DEG, (h + 270) % DEG];
    case 'TETRADIC':
      return [h, (h + 60) % DEG, (h + 180) % DEG, (h + 240) % DEG];
  }
};

const HARMONY_MODES: readonly ColorHarmonyMode[] = [
  'PRIMARY',
  'SQUARE',
  'COMPLEMENTARY',
  'TRIAD',
  'ANALOGOUS',
  'TETRADIC',
];

export const pickHarmony = (rng: Rng): ColorHarmonyMode => {
  const idx = Math.floor(rng() * HARMONY_MODES.length);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return HARMONY_MODES[idx]!;
};
