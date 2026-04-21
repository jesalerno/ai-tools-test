import { mapByIndex } from '../colors.js';
import type { FractalMethod } from '../../shared/types.js';
import type { SeededRandom } from '../random.js';

interface Color {
  r: number;
  g: number;
  b: number;
}

export interface RenderConfig {
  width: number;
  height: number;
  iterations: number;
  zoom: number;
  random: SeededRandom;
  palette: Color[];
}

export interface RenderResult {
  rgba: Uint8ClampedArray;
  coverage: number;
}

interface NewtonResult {
  iter: number;
  rootIndex: number;
}

const MAX_ITER = 2000;
const IFS_ITERS = 200000;
const ATTRACTOR_ITERS = 280000;
const FLAME_ITERS = 220000;

const ROOTS: Array<[number, number]> = [
  [1, 0],
  [-0.5, Math.sqrt(3) / 2],
  [-0.5, -Math.sqrt(3) / 2],
];

export const RENDERER_MAP: Record<FractalMethod, (config: RenderConfig) => RenderResult> = {
  MANDELBROT: renderMandelbrot,
  JULIA: renderJulia,
  BURNING_SHIP: renderBurningShip,
  NEWTON: renderNewton,
  LYAPUNOV: renderLyapunov,
  IFS: renderIfs,
  L_SYSTEM: renderLSystem,
  STRANGE_ATTRACTOR: renderStrangeAttractor,
  HEIGHTMAP: renderHeightmap,
  FLAME: renderFlame,
  PHASE_PLOT: renderPhasePlot,
};

function renderEscape(
  config: RenderConfig,
  iterate: (zx: number, zy: number, cx: number, cy: number) => [number, number],
  zFromPixel: (x: number, y: number, width: number, height: number, zoom: number) => [number, number],
  cFromPixel: (x: number, y: number, width: number, height: number, zoom: number) => [number, number],
): RenderResult {
  const { width, height, iterations, zoom, palette } = config;
  const rgba = new Uint8ClampedArray(width * height * 4);
  let filled = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let [zx, zy] = zFromPixel(x, y, width, height, zoom);
      const [cx, cy] = cFromPixel(x, y, width, height, zoom);
      let iter = 0;

      while (iter < iterations && (zx * zx) + (zy * zy) <= 4) {
        [zx, zy] = iterate(zx, zy, cx, cy);
        iter += 1;
      }

      const pixelIndex = (y * width + x) * 4;
      const t = Math.log(iter + 1) / Math.log(Math.min(MAX_ITER, iterations) + 1);
      const color = mapByIndex(palette, t);
      rgba[pixelIndex] = color.r;
      rgba[pixelIndex + 1] = color.g;
      rgba[pixelIndex + 2] = color.b;
      rgba[pixelIndex + 3] = 255;
      if (iter > 1) filled += 1;
    }
  }

  return { rgba, coverage: filled / (width * height) };
}

function renderMandelbrot(config: RenderConfig): RenderResult {
  return renderEscape(
    config,
    (zx, zy, cx, cy) => [zx * zx - zy * zy + cx, 2 * zx * zy + cy],
    () => [0, 0],
    (x, y, width, height, zoom) => [
      ((x - width / 2) / (0.5 * zoom * width)) - 0.5,
      (y - height / 2) / (0.5 * zoom * height),
    ]
  );
}

function renderJulia(config: RenderConfig): RenderResult {
  const cRe = (config.random.next() * 1.6) - 0.8;
  const cIm = (config.random.next() * 1.6) - 0.8;

  return renderEscape(
    config,
    (zx, zy) => [zx * zx - zy * zy + cRe, 2 * zx * zy + cIm],
    (x, y, width, height, zoom) => [
      (x - width / 2) / (0.5 * zoom * width),
      (y - height / 2) / (0.5 * zoom * height),
    ],
    () => [cRe, cIm],
  );
}

function renderBurningShip(config: RenderConfig): RenderResult {
  return renderEscape(
    config,
    (zx, zy, cx, cy) => {
      const ax = Math.abs(zx);
      const ay = Math.abs(zy);
      return [ax * ax - ay * ay + cx, 2 * ax * ay + cy];
    },
    () => [0, 0],
    (x, y, width, height, zoom) => [
      (x - width / 2) / (0.5 * zoom * width) - 0.2,
      (y - height / 2) / (0.5 * zoom * height) - 0.45,
    ]
  );
}

function renderNewton(config: RenderConfig): RenderResult {
  const { width, height, zoom, palette } = config;
  const rgba = new Uint8ClampedArray(width * height * 4);
  let filled = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const result = iterateNewton({ x, y, width, height, zoom, iterations: config.iterations });
      const pixelIndex = (y * width + x) * 4;
      const color = pickNewtonColor(result.rootIndex, result.iter, palette);
      rgba[pixelIndex] = color.r;
      rgba[pixelIndex + 1] = color.g;
      rgba[pixelIndex + 2] = color.b;
      rgba[pixelIndex + 3] = 255;
      if (result.iter > 0) filled += 1;
    }
  }

  return { rgba, coverage: filled / (width * height) };
}

function iterateNewton(input: { x: number; y: number; width: number; height: number; zoom: number; iterations: number }): NewtonResult {
  let zx = (input.x - input.width / 2) / (0.5 * input.zoom * input.width);
  let zy = (input.y - input.height / 2) / (0.5 * input.zoom * input.height);
  let iter = 0;

  while (iter < input.iterations) {
    const r2 = (zx * zx) + (zy * zy);
    if (r2 < 1e-10) break;

    const fRe = (zx * zx * zx) - (3 * zx * zy * zy) - 1;
    const fIm = (3 * zx * zx * zy) - (zy * zy * zy);
    const dfRe = 3 * (zx * zx - zy * zy);
    const dfIm = 6 * zx * zy;
    const denom = (dfRe * dfRe) + (dfIm * dfIm);
    if (denom < 1e-10) break;

    const divRe = ((fRe * dfRe) + (fIm * dfIm)) / denom;
    const divIm = ((fIm * dfRe) - (fRe * dfIm)) / denom;
    zx -= divRe;
    zy -= divIm;

    if ((fRe * fRe) + (fIm * fIm) < 1e-8) break;
    iter += 1;
  }

  return { iter, rootIndex: nearestRootIndex(zx, zy) };
}

function nearestRootIndex(zx: number, zy: number): number {
  let rootIndex = 0;
  let minDist = Number.POSITIVE_INFINITY;

  for (let i = 0; i < ROOTS.length; i += 1) {
    const root = ROOTS[i] ?? ROOTS[0];
    const dx = zx - root[0];
    const dy = zy - root[1];
    const d = Math.sqrt((dx * dx) + (dy * dy));
    if (d < minDist) {
      minDist = d;
      rootIndex = i;
    }
  }

  return rootIndex;
}

function pickNewtonColor(rootIndex: number, iter: number, palette: Color[]): Color {
  const stride = 13;
  const idx = (rootIndex * stride + (iter % stride)) % palette.length;
  return palette[idx] ?? palette[0] ?? { r: 32, g: 32, b: 32 };
}

function renderLyapunov(config: RenderConfig): RenderResult {
  const { width, height, iterations, palette } = config;
  const rgba = new Uint8ClampedArray(width * height * 4);
  let filled = 0;
  const sequence = pickLyapunovSequence(config.random.nextInt(0, 2));

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const exponent = computeLyapunov(
        2.5 + (x / width) * 1.5,
        2.5 + (y / height) * 1.5,
        iterations,
        sequence,
      );
      const pixelIndex = (y * width + x) * 4;
      const abs = Math.min(1, Math.abs(exponent) / 2);
      const base = mapByIndex(palette, abs);
      const scale = exponent < 0 ? 0.2 : 1;
      rgba[pixelIndex] = Math.max(8, Math.round(base.r * scale));
      rgba[pixelIndex + 1] = Math.max(8, Math.round(base.g * scale));
      rgba[pixelIndex + 2] = Math.max(8, Math.round(base.b * scale));
      rgba[pixelIndex + 3] = 255;
      if (abs > 0.05) filled += 1;
    }
  }

  return { rgba, coverage: filled / (width * height) };
}

function pickLyapunovSequence(index: number): string {
  if (index === 0) return 'AB';
  if (index === 1) return 'AAB';
  return 'ABB';
}

function computeLyapunov(a: number, b: number, iterations: number, sequence: string): number {
  let val = 0.5;
  let sum = 0;

  for (let i = 0; i < iterations; i += 1) {
    const r = sequence[i % sequence.length] === 'A' ? a : b;
    val = r * val * (1 - val);
    const derivative = Math.abs(r * (1 - 2 * val));
    if (derivative > 1e-8) sum += Math.log(derivative);
  }

  return sum / iterations;
}

function findMinMax(values: Float64Array): [number, number] {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (let i = 0; i < values.length; i += 1) {
    const value = values[i] ?? 0;
    if (value < min) min = value;
    if (value > max) max = value;
  }

  return [min, max];
}

function mapDensityToRgba(width: number, height: number, density: Float64Array, palette: Color[]): RenderResult {
  const rgba = new Uint8ClampedArray(width * height * 4);
  const [minDensity, maxDensity] = findMinMax(density);
  const range = Math.max(1e-8, maxDensity - minDensity);
  let filled = 0;

  for (let i = 0; i < density.length; i += 1) {
    const d = (density[i] ?? 0) - minDensity;
    const t = Math.pow(Math.log(d + 1) / Math.log(range + 1), 0.5);
    const color = mapByIndex(palette, t);
    const pixelIndex = i * 4;
    rgba[pixelIndex] = color.r;
    rgba[pixelIndex + 1] = color.g;
    rgba[pixelIndex + 2] = color.b;
    rgba[pixelIndex + 3] = 255;
    if (t > 0.08) filled += 1;
  }

  return { rgba, coverage: filled / (width * height) };
}

function renderIfs(config: RenderConfig): RenderResult {
  const { width, height } = config;
  const density = new Float64Array(width * height);
  let x = 0;
  let y = 0;

  for (let i = 0; i < IFS_ITERS; i += 1) {
    const [nx, ny] = stepIfs(config.random.next(), x, y);
    x = nx;
    y = ny;

    const px = Math.floor(((x + 3) / 6) * width);
    const py = Math.floor(height - ((y / 10) * height));
    if (px >= 0 && px < width && py >= 0 && py < height) {
      density[py * width + px] += 1;
    }
  }

  return mapDensityToRgba(width, height, density, config.palette);
}

function stepIfs(r: number, x: number, y: number): [number, number] {
  if (r < 0.01) return [0, 0.16 * y];
  if (r < 0.86) return [0.85 * x + 0.04 * y, -0.04 * x + 0.85 * y + 1.6];
  if (r < 0.93) return [0.2 * x - 0.26 * y, 0.23 * x + 0.22 * y + 1.6];
  return [-0.15 * x + 0.28 * y, 0.26 * x + 0.24 * y + 0.44];
}

function renderLSystem(config: RenderConfig): RenderResult {
  const { width, height, palette } = config;
  const density = new Float64Array(width * height);
  const sequence = expandLSystem('FX', 12);
  let x = width * 0.25;
  let y = height * 0.75;
  let angle = 0;
  const step = Math.max(1, Math.floor(width / 320));

  for (let i = 0; i < sequence.length; i += 1) {
    const char = sequence[i] ?? '';
    if (char === 'F') {
      x += Math.cos(angle) * step;
      y += Math.sin(angle) * step;
      const px = Math.floor(Math.max(0, Math.min(width - 1, x)));
      const py = Math.floor(Math.max(0, Math.min(height - 1, y)));
      density[py * width + px] += 1;
      continue;
    }

    if (char === '+') angle += Math.PI / 2;
    if (char === '-') angle -= Math.PI / 2;
  }

  return mapDensityToRgba(width, height, density, palette);
}

function expandLSystem(seed: string, rounds: number): string {
  const replacement = new Map<string, string>([['X', 'X+YF+'], ['Y', '-FX-Y']]);
  let sequence = seed;

  for (let i = 0; i < rounds; i += 1) {
    let next = '';
    for (let j = 0; j < sequence.length; j += 1) {
      const char = sequence[j] ?? '';
      next += replacement.get(char) ?? char;
    }
    sequence = next;
  }

  return sequence;
}

function renderStrangeAttractor(config: RenderConfig): RenderResult {
  const { width, height, palette } = config;
  const density = new Float64Array(width * height);
  const params = {
    a: -1.4 + config.random.next() * 0.8,
    b: 1.6 + config.random.next() * 0.8,
    c: 1.0 + config.random.next(),
    d: 0.7 + config.random.next(),
  };
  let x = 0.1;
  let y = 0.1;

  for (let i = 0; i < ATTRACTOR_ITERS; i += 1) {
    const nx = Math.sin(params.a * y) - Math.cos(params.b * x);
    const ny = Math.sin(params.c * x) - Math.cos(params.d * y);
    x = nx;
    y = ny;
    const px = Math.floor(((x + 2.5) / 5) * width);
    const py = Math.floor(((y + 2.5) / 5) * height);
    if (px >= 0 && px < width && py >= 0 && py < height) {
      density[py * width + px] += 1;
    }
  }

  return mapDensityToRgba(width, height, density, palette);
}

function renderHeightmap(config: RenderConfig): RenderResult {
  const { width, height, palette, zoom } = config;
  const rgba = new Uint8ClampedArray(width * height * 4);
  let filled = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const value = noise((x / width) * zoom * 4, (y / height) * zoom * 4, config.random.next() * 10);
      const t = Math.log((value * 0.5) + 1) / Math.log(1.5);
      const color = mapByIndex(palette, t);
      const pixelIndex = (y * width + x) * 4;
      rgba[pixelIndex] = color.r;
      rgba[pixelIndex + 1] = color.g;
      rgba[pixelIndex + 2] = color.b;
      rgba[pixelIndex + 3] = 255;
      if (t > 0.2) filled += 1;
    }
  }

  return { rgba, coverage: filled / (width * height) };
}

function renderFlame(config: RenderConfig): RenderResult {
  const { width, height } = config;
  const density = new Float64Array(width * height);
  const transforms = [
    { a: 0.712, b: -0.418, c: 0.223, d: 0.578, e: 0.15, f: -0.04 },
    { a: -0.491, b: 0.682, c: -0.643, d: -0.357, e: -0.2, f: 0.12 },
    { a: 0.571, b: 0.411, c: -0.479, d: 0.662, e: 0.0, f: 0.2 },
  ];
  let x = 0;
  let y = 0;

  for (let i = 0; i < FLAME_ITERS; i += 1) {
    const t = transforms[Math.floor(config.random.next() * transforms.length)] ?? transforms[0];
    const nx = (t.a * x) + (t.b * y) + t.e;
    const ny = (t.c * x) + (t.d * y) + t.f;
    x = Math.sin(nx) + (0.5 * nx);
    y = Math.sin(ny) + (0.5 * ny);

    if (i < 20) continue;

    const px = Math.floor(((x + 2.5) / 5) * width);
    const py = Math.floor(((y + 2.5) / 5) * height);
    if (px >= 0 && px < width && py >= 0 && py < height) {
      density[py * width + px] += 1;
    }
  }

  return mapDensityToRgba(width, height, density, config.palette);
}

function renderPhasePlot(config: RenderConfig): RenderResult {
  const { width, height, palette } = config;
  const rgba = new Uint8ClampedArray(width * height * 4);
  let filled = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const re = ((x / width) * 4) - 2;
      const im = ((y / height) * 4) - 2;
      const expRe = Math.exp(re) * Math.cos(im);
      const expIm = Math.exp(re) * Math.sin(im);
      const magnitude = Math.max(1e-8, Math.sqrt((expRe * expRe) + (expIm * expIm)));
      const phase = (Math.atan2(expIm, expRe) + Math.PI) / (2 * Math.PI);
      const brightness = 0.62 + (0.35 * Math.abs(Math.sin(Math.PI * Math.log(magnitude))));
      const color = mapByIndex(palette, phase);
      const pixelIndex = (y * width + x) * 4;
      rgba[pixelIndex] = Math.max(8, Math.round(color.r * brightness));
      rgba[pixelIndex + 1] = Math.max(8, Math.round(color.g * brightness));
      rgba[pixelIndex + 2] = Math.max(8, Math.round(color.b * brightness));
      rgba[pixelIndex + 3] = 255;
      if (brightness > 0.5) filled += 1;
    }
  }

  return { rgba, coverage: filled / (width * height) };
}

function noise(x: number, y: number, seed: number): number {
  const v = Math.sin((x * 12.9898) + (y * 78.233) + (seed * 37.719));
  return (v - Math.floor(v)) * 2;
}
