import { FractalGenerator, FractalOptions } from './FractalGenerator';

/**
 * Flame Fractal Generator
 * Probabilistic IFS with non-linear variations
 */
export class FlameGenerator implements FractalGenerator {
  generate(
    width: number,
    height: number,
    options: FractalOptions = {}
  ): number[][] {
    let iterations = options.maxIterations as number ?? 100000;
    const variations = options.variations as string[] ?? ['linear', 'sinusoidal', 'spherical'];
    const MIN_COVERAGE = 0.8; // 80% minimum coverage

    // Affine transformations with variations
    const transforms = [
      { a: 0.8, b: 0, c: 0, d: 0.8, e: 0, f: 0, weight: 0.3, variation: 'linear' },
      { a: 0.2, b: -0.2, c: 0.2, d: 0.2, e: 0, f: 0.8, weight: 0.3, variation: 'sinusoidal' },
      { a: -0.2, b: 0.2, c: 0.2, d: 0.2, e: 0, f: -0.8, weight: 0.2, variation: 'spherical' },
      { a: 0.1, b: 0, c: 0, d: 0.1, e: 0, f: 0, weight: 0.2, variation: 'linear' },
    ];

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

      let x = 0;
      let y = 0;

      for (let i = 0; i < iterations; i++) {
        const r = Math.random();
        let sum = 0;
        let transform = transforms[0];

        for (const t of transforms) {
          sum += t.weight;
          if (r <= sum) {
            transform = t;
            break;
          }
        }

        // Apply affine transformation
        const newX = transform.a * x + transform.b * y + transform.e;
        const newY = transform.c * x + transform.d * y + transform.f;

        // Apply variation
        let vx = newX;
        let vy = newY;

        if (transform.variation === 'sinusoidal') {
          vx = Math.sin(newX);
          vy = Math.sin(newY);
        } else if (transform.variation === 'spherical') {
          const r2 = newX * newX + newY * newY;
          if (r2 > 0) {
            vx = newX / r2;
            vy = newY / r2;
          }
        }

        x = vx;
        y = vy;

        // Map to pixel coordinates
        const px = Math.floor((x + 1) * (width / 2));
        const py = Math.floor((y + 1) * (height / 2));

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
