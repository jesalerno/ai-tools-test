export class SeededRandom {
  private state: number;

  public constructor(seed: number) {
    this.state = seed >>> 0;
  }

  public next(): number {
    this.state += 0x6D2B79F5;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  public pick<T>(values: readonly T[]): T {
    const value = values[Math.floor(this.next() * values.length)];
    if (value === undefined) {
      throw new Error('Cannot pick from empty list');
    }

    return value;
  }
}

export function createSeed(input?: number): number {
  if (typeof input === 'number' && Number.isInteger(input)) {
    return input;
  }

  return Math.floor(Date.now() % 2147483647);
}
