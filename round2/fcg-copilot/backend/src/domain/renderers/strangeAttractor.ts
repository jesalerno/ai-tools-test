// Strange Attractor renderer (Clifford class)

import { buildLogPalette, mapColor, logDensityT } from '../palette.js';
import type { RenderOpts } from '../registry.js';

const SA_ITERS = 2000000;
const WARM_UP = 100;

interface AttractorParams { a: number; b: number; c: number; d: number; }

/**
 * Curated table of known-chaotic Clifford attractor parameters.
 * Each entry was verified to produce a spread, space-filling chaotic orbit
 * (not a fixed point or periodic cycle) for the formula:
 *   x' = sin(a·y) + c·cos(a·x)
 *   y' = sin(b·x) + d·cos(b·y)
 */
const CLIFFORD_TABLE: AttractorParams[] = [
  { a: -1.4,  b:  1.6, c:  1.0,  d:  0.7  },
  { a: -1.7,  b:  1.3, c: -0.1,  d: -0.9  },
  { a:  1.6,  b: -0.6, c: -1.2,  d:  1.6  },
  { a: -1.8,  b: -2.0, c: -0.5,  d: -0.9  },
  { a: -1.6,  b:  1.6, c:  0.6,  d: -1.1  },
  { a:  2.0,  b: -1.6, c: -0.5,  d:  0.5  },
  { a: -2.1,  b: -2.0, c:  0.5,  d:  1.0  },
  { a:  1.7,  b:  1.7, c:  0.6,  d:  1.2  },
  { a: -1.2,  b:  1.8, c: -1.4,  d: -1.8  },
  { a: -1.9,  b: -1.9, c:  0.5,  d:  0.5  },
  { a:  1.5,  b: -1.8, c:  1.6,  d:  0.9  },
  { a: -1.5,  b:  2.3, c:  0.4,  d: -2.2  },
  { a: -2.3,  b:  1.7, c:  0.5,  d: -1.5  },
  { a:  1.8,  b: -2.0, c: -0.9,  d:  1.1  },
  { a: -1.1,  b: -1.1, c:  0.9,  d: -0.9  },
  { a:  2.4,  b: -2.4, c:  0.6,  d: -0.6  },
];

/** Accumulate Clifford attractor density into the pixel grid */
function accumulateAttractor(
  density: Float32Array,
  width: number,
  height: number,
  params: AttractorParams,
): void {
  const { a, b, c, d } = params;
  let x = 0.1, y = 0.1;

  // Warm up — discard transient before plotting
  for (let i = 0; i < WARM_UP; i++) {
    const nx = Math.sin(a * y) + c * Math.cos(a * x);
    const ny = Math.sin(b * x) + d * Math.cos(b * y);
    x = nx; y = ny;
  }

  // Safe fixed window: Clifford x' = sin(a*y)+c*cos(a*x) gives |x'| ≤ 1+|c| ≤ 3.5
  const WIN = 3.5;
  const scaleX = width  / (2 * WIN);
  const scaleY = height / (2 * WIN);

  for (let i = 0; i < SA_ITERS; i++) {
    const nx = Math.sin(a * y) + c * Math.cos(a * x);
    const ny = Math.sin(b * x) + d * Math.cos(b * y);
    x = nx; y = ny;
    const col = Math.floor((x + WIN) * scaleX);
    const row = Math.floor((y + WIN) * scaleY);
    if (col >= 0 && col < width && row >= 0 && row < height) {
      density[row * width + col] += 1;
    }
  }
}

/** Color density into pixel buffer */
function colorAttractor(
  buf: Uint8ClampedArray,
  density: Float32Array,
  palette: ReturnType<typeof buildLogPalette>,
): void {
  let maxD = 0;
  for (let i = 0; i < density.length; i++) {
    if (density[i] > maxD) maxD = density[i];
  }
  for (let i = 0; i < density.length; i++) {
    const t = logDensityT(density[i], maxD);
    const idx = i * 4;
    if (t > 0) {
      const col = mapColor(t, palette);
      buf[idx] = col.r; buf[idx + 1] = col.g; buf[idx + 2] = col.b; buf[idx + 3] = 255;
    } else {
      buf[idx] = 10; buf[idx + 1] = 8; buf[idx + 2] = 40; buf[idx + 3] = 255;
    }
  }
}

/** Render Clifford strange attractor */
export function renderStrangeAttractor(
  buf: Uint8ClampedArray,
  width: number,
  height: number,
  opts: RenderOpts,
): void {
  const { seed, harmony } = opts;
  const palette = buildLogPalette((seed * 43.9) % 360, harmony, 256);
  // Pick from the verified-chaotic parameter table; use seed for variety
  const params = CLIFFORD_TABLE[seed % CLIFFORD_TABLE.length];
  const density = new Float32Array(width * height);
  accumulateAttractor(density, width, height, params);
  colorAttractor(buf, density, palette);
}
