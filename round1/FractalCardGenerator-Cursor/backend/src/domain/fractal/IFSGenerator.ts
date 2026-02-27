import { FractalGenerator, FractalOptions } from './FractalGenerator';

/**
 * Iterated Function Systems Generator
 * Randomly picks from affine transformations and iterates a point
 */
export class IFSGenerator implements FractalGenerator {
  generate(
    width: number,
    height: number,
    options: FractalOptions = {}
  ): number[][] {
    let iterations = options.maxIterations as number ?? 100000;
    const type = options.type as string ?? 'fern';
    const MIN_COVERAGE = 0.8; // 80% minimum coverage

    // Barnsley Fern transformations
    const fernTransforms = [
      { a: 0, b: 0, c: 0, d: 0.16, e: 0, f: 0, p: 0.01 },
      { a: 0.85, b: 0.04, c: -0.04, d: 0.85, e: 0, f: 1.6, p: 0.85 },
      { a: 0.2, b: -0.26, c: 0.23, d: 0.22, e: 0, f: 1.6, p: 0.07 },
      { a: -0.15, b: 0.28, c: 0.26, d: 0.24, e: 0, f: 0.44, p: 0.07 },
    ];

    // Sierpiński Triangle transformations
    const sierpinskiTransforms = [
      { a: 0.5, b: 0, c: 0, d: 0.5, e: 0, f: 0, p: 0.33 },
      { a: 0.5, b: 0, c: 0, d: 0.5, e: 0.5, f: 0, p: 0.33 },
      { a: 0.5, b: 0, c: 0, d: 0.5, e: 0.25, f: 0.5, p: 0.34 },
    ];

    const transforms = type === 'fern' ? fernTransforms : sierpinskiTransforms;

    // Scale and offset for rendering
    const scale = type === 'fern' ? 50 : 200;
    const offsetX = type === 'fern' ? width / 2 : width / 4;
    const offsetY = type === 'fern' ? height : height / 4;

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
          sum += t.p;
          if (r <= sum) {
            transform = t;
            break;
          }
        }

        const newX = transform.a * x + transform.b * y + transform.e;
        const newY = transform.c * x + transform.d * y + transform.f;
        x = newX;
        y = newY;

        // Map to pixel coordinates
        const px = Math.floor(x * scale + offsetX);
        const py = Math.floor(y * scale + offsetY);

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

    // Normalize density to 0-255
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
