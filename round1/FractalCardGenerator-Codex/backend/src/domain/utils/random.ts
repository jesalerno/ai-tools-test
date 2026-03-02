export interface Rng {
  next: () => number;
  int: (min: number, max: number) => number;
  pick: <T>(values: readonly T[]) => T;
}

export function createSeededRng(seed: number): Rng {
  let state = seed >>> 0;

  const next = (): number => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (min: number, max: number): number => {
    const value = next();
    return Math.floor(value * (max - min + 1)) + min;
  };

  const pick = <T>(values: readonly T[]): T => {
    const index = int(0, values.length - 1);
    return values[index];
  };

  return {next, int, pick};
}

export function makeSeed(input?: number): number {
  if (typeof input === 'number' && Number.isFinite(input)) {
    return Math.abs(Math.floor(input)) % 2147483647;
  }

  const now = Date.now();
  const jitter = Math.floor(Math.random() * 100000);
  return (now + jitter) % 2147483647;
}
