import { FractalGenerator, FractalOptions } from './FractalGenerator';

/**
 * Strange Attractor Generator
 * Iterates chaotic maps and plots points with alpha blending
 */
export class StrangeAttractorGenerator implements FractalGenerator {
  generate(
    width: number,
    height: number,
    options: FractalOptions = {}
  ): number[][] {
    let iterations = options.maxIterations as number ?? 100000;
    const type = options.type as string ?? 'lorenz';
    const MIN_COVERAGE = 0.8; // 80% minimum coverage

    // Parameters for different attractors
    const params:
      | { a: number; b: number; c: number; d?: number }
      | { a: number; b: number; c: number } =
      type === 'lorenz'
        ? { a: 10, b: 28, c: 8 / 3 }
        : type === 'clifford'
        ? { a: -1.4, b: 1.6, c: 1.0, d: 0.7 }
        : { a: 1.4, b: -2.3, c: 2.4, d: -2.1 }; // de Jong

    // Adaptive iteration: continue until coverage is sufficient
    let density: number[][];
    let coverage = 0;
    const maxAttempts = 5;
    let attempt = 0;

    do {
      // Initialize density map
      density = Array(height)
        .fill(0)
        .map(() => Array(width).fill(0));

      let x = 0.1;
      let y = 0.1;
      let z = 0.1;

      for (let i = 0; i < iterations; i++) {
        let newX: number, newY: number, newZ: number;

        if (type === 'lorenz') {
          const dt = 0.01;
          newX = x + params.a * (y - x) * dt;
          newY = y + (x * (params.b - z) - y) * dt;
          newZ = z + (x * y - params.c * z) * dt;
        } else if (type === 'clifford') {
          const cliffordParams = params as { a: number; b: number; c: number; d: number };
          newX = Math.sin(cliffordParams.a * y) + cliffordParams.c * Math.cos(cliffordParams.a * x);
          newY = Math.sin(cliffordParams.b * x) + cliffordParams.d * Math.cos(cliffordParams.b * y);
          newZ = z;
        } else {
          // de Jong
          const dejongParams = params as { a: number; b: number; c: number; d: number };
          newX = Math.sin(dejongParams.a * y) - Math.cos(dejongParams.b * x);
          newY = Math.sin(dejongParams.c * x) - Math.cos(dejongParams.d * y);
          newZ = z;
        }

        x = newX;
        y = newY;
        z = newZ;

        // Map to 2D projection
        const px = Math.floor((x + 20) * (width / 40));
        const py = Math.floor((y + 20) * (height / 40));

        if (px >= 0 && px < width && py >= 0 && py < height) {
          density[py][px]++;
        }
      }

      // Calculate coverage (percentage of non-zero pixels)
      let nonZeroPixels = 0;
      const totalPixels = width * height;
      for (const row of density) {
        for (const val of row) {
          if (val > 0) nonZeroPixels++;
        }
      }
      coverage = nonZeroPixels / totalPixels;

      // Increase iterations if coverage is insufficient
      if (coverage < MIN_COVERAGE && attempt < maxAttempts) {
        iterations = Math.floor(iterations * 1.5); // Increase by 50%
        attempt++;
      }
    } while (coverage < MIN_COVERAGE && attempt < maxAttempts);

    // Normalize density
    let maxDensity = 0;
    for (const row of density) {
      for (const val of row) {
        if (val > maxDensity) maxDensity = val;
      }
    }
    return density.map((row) =>
      row.map((val) => (maxDensity > 0 ? Math.floor((val / maxDensity) * 255) : 0))
    );
  }
}
