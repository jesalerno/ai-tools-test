import { FractalGenerator, FractalOptions } from './FractalGenerator';

/**
 * Escape-Time Heightmap Generator
 * Uses fractal noise (Perlin-like) to generate heightmaps
 */
export class HeightmapGenerator implements FractalGenerator {
  generate(
    width: number,
    height: number,
    options: FractalOptions = {}
  ): number[][] {
    const octaves = options.octaves as number ?? 4;
    const persistence = options.persistence as number ?? 0.5;
    const scale = options.scale as number ?? 0.1;
    const seed = options.seed as number ?? Math.random() * 1000;

    const result: number[][] = [];

    for (let y = 0; y < height; y++) {
      const row: number[] = [];
      for (let x = 0; x < width; x++) {
        let value = 0;
        let amplitude = 1;
        let frequency = scale;

        for (let i = 0; i < octaves; i++) {
          value += this.noise(x * frequency, y * frequency, seed + i) * amplitude;
          amplitude *= persistence;
          frequency *= 2;
        }

        // Normalize to 0-255
        const normalized = ((value + 1) / 2) * 255;
        row.push(Math.floor(Math.max(0, Math.min(255, normalized))));
      }
      result.push(row);
    }

    return result;
  }

  private noise(x: number, y: number, seed: number): number {
    // Simple Perlin-like noise using hash function
    const n = Math.floor(x) + Math.floor(y) * 57 + Math.floor(seed);
    const hash = ((n << 13) ^ n) * 0.5;
    const noise = (1.0 - ((hash * (hash * hash * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0);
    return noise;
  }
}
