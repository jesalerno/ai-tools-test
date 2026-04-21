// Mulberry32 PRNG — fast, seedable, sufficient for visual fractal variation.
// Deterministic per-seed so tests can assert stable outputs.

export interface Rng {
  (): number;
  readonly seed: number;
}

const MULT_A = 0x6d2b79f5;
const SHIFT_1 = 15;
const SHIFT_2 = 7;
const SHIFT_3 = 14;

export const createRng = (seed: number): Rng => {
  let state = seed | 0;
  const rng: Rng = Object.assign(
    () => {
      state = (state + MULT_A) | 0;
      let t = state;
      t = Math.imul(t ^ (t >>> SHIFT_1), t | 1);
      t ^= t + Math.imul(t ^ (t >>> SHIFT_2), t | 61);
      return ((t ^ (t >>> SHIFT_3)) >>> 0) / 4_294_967_296;
    },
    { seed },
  );
  return rng;
};

export const randomSeed = (): number =>
  Math.floor(Math.random() * 2 ** 31);

export const rngInt = (rng: Rng, min: number, max: number): number =>
  Math.floor(rng() * (max - min + 1)) + min;

export const rngRange = (rng: Rng, min: number, max: number): number =>
  rng() * (max - min) + min;

export const rngPick = <T>(rng: Rng, items: readonly T[]): T => {
  if (items.length === 0) throw new Error('rngPick: empty array');
  const idx = Math.floor(rng() * items.length);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return items[idx]!;
};
